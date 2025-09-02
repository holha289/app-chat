import { useEffect, useRef, useState } from "react";
import { getSocket } from "@app/core/socketIo";
import InCallManager from "react-native-incall-manager";
import {
  mediaDevices,
  RTCPeerConnection,
  RTCIceCandidate,
  RTCSessionDescription,
  MediaStream,
} from "react-native-webrtc";
import { requestMediaPermissions } from "@app/core/permissions";

const pcConfig: RTCConfiguration = {
  iceServers: [
    { urls: ["stun:stun.l.google.com:19302"] },
    { urls: ["stun:stun1.l.google.com:19302"] },
    { urls: ["stun:stun2.l.google.com:19302"] },
    // Comment out TURN server nếu không có
    // {
    //   urls: "turn:your-domain.com:3478",
    //   username: "webrtc",
    //   credential: "superSecretPassword",
    // },
  ],
  iceCandidatePoolSize: 10,
  iceTransportPolicy: 'all',
  bundlePolicy: 'max-bundle',
  rtcpMuxPolicy: 'require',
};

// Hàng đợi ICE khi remoteDescription chưa có
const pendingCandidates = new Map<string, RTCIceCandidateInit[]>();

export const useWebRTC = (isVideoCall: boolean = false) => {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  const peers = useRef<Map<string, RTCPeerConnection>>(new Map());
  const reconnectAttempts = useRef<Map<string, number>>(new Map());
  const reconnectTimers = useRef<Map<string, NodeJS.Timeout>>(new Map());
  const socketIo = getSocket();

  // Khởi tạo local stream với error handling tốt hơn
  const initStream = async () => {
    try {
      if (localStream) {
        console.log("📱 Stream already exists, reusing...");
        return localStream;
      }

      const ok = await requestMediaPermissions();
      if (!ok) {
        console.error("❌ User từ chối quyền Camera/Micro");
        return null;
      }
      
      const stream = await mediaDevices.getUserMedia({
        audio: true,
        video: isVideoCall,
      });
      
      if (!stream) {
        console.error("❌ Failed to get media stream");
        return null;
      }

      setLocalStream(stream);
      setIsInitialized(true);
      
      // Cài đặt InCallManager cho phù hợp với loại cuộc gọi
      try {
        InCallManager.start({ media: isVideoCall ? "video" : "audio" });
      } catch (error) {
        console.error("❌ Error starting InCallManager:", error);
      }

      return stream;
    } catch (err) {
      console.error("❌ Error init media:", err);
      return null;
    }
  };

  const createPeerConnection = (roomId: string, peerId: string, forceStream?: MediaStream) => {
    try {
      // Sử dụng stream được truyền vào nếu có
      const streamToUse = forceStream || localStream;
      
      if (!streamToUse) {
        console.error("❌ Cannot create peer connection: No stream available");
        return null;
      }
      
      // Kiểm tra nếu peer connection đã tồn tại
      if (peers.current.has(peerId)) {
        console.log(`♻️ Peer connection for ${peerId} already exists`);
        return peers.current.get(peerId)!;
      }

      const pc = new RTCPeerConnection(pcConfig);
      peers.current.set(peerId, pc);

      // Thêm local track với error handling
      streamToUse.getTracks().forEach((track) => {
        try {
          pc.addTrack(track, streamToUse);
        } catch (error) {
          console.error(`❌ Error adding track:`, error);
        }
      });

      // ICE Candidate
      pc.onicecandidate = (event) => {
        try {
          if (event.candidate && socketIo) {
            socketIo.emit("call:signal", {
              peerId: peerId,
              roomId,
              candidate: event.candidate,
            });
          }
        } catch (error) {
          console.error("❌ Error handling ICE candidate:", error);
        }
      };

      // Enhanced connection state monitoring với error handling
      pc.oniceconnectionstatechange = () => {
        try {
          const attempts = reconnectAttempts.current.get(peerId) || 0;
          
          switch (pc.iceConnectionState) {
            case 'connected':
              console.log(`✅ WebRTC connected for peer ${peerId}`);
              reconnectAttempts.current.set(peerId, 0);
              const timer = reconnectTimers.current.get(peerId);
              if (timer) {
                clearTimeout(timer);
                reconnectTimers.current.delete(peerId);
              }
              break;
              
            case 'disconnected':
              console.log(`⚠️ WebRTC disconnected for peer ${peerId}`);
              const disconnectTimer = setTimeout(() => {
                if (pc.iceConnectionState === 'disconnected') {
                  attemptReconnection(peerId, roomId);
                }
              }, 3000);
              reconnectTimers.current.set(peerId, disconnectTimer);
              break;
              
            case 'failed':
              console.error(`❌ WebRTC connection failed for peer ${peerId}`);
              attemptReconnection(peerId, roomId);
              break;
              
            case 'closed':
              console.log(`🔴 WebRTC connection closed for peer ${peerId}`);
              cleanupPeer(peerId);
              break;
          }
        } catch (error) {
          console.error("❌ Error in ice connection state change:", error);
        }
      };

      // Remote track với error handling
      pc.ontrack = (event) => {
        try {
          if (event.streams && event.streams[0]) {
            const stream = event.streams[0];
            setRemoteStream(stream as any);
          }
        } catch (error) {
          console.error("❌ Error handling remote track:", error);
        }
      };

      // Error handler cho peer connection
      pc.onerror = (error) => {
        console.error(`❌ Peer connection error for ${peerId}:`, error);
      };

      return pc;
    } catch (error) {
      console.error("❌ Error creating peer connection:", error);
      return null;
    }
  };

  // Caller với error handling
  const caller = async (roomId: string, calleeId: string) => {
    try {
      const stream = await initStream();
      if (!stream) {
        console.error("❌ Failed to initialize local stream for caller");
        return;
      }
      
      const pc = createPeerConnection(roomId, calleeId, stream);
      if (!pc) {
        console.error("❌ Failed to create peer connection");
        return;
      }

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      
      if (socketIo) {
        socketIo.emit("call:signal", {
          peerId: calleeId,
          roomId,
          offer,
        });
      }
    } catch (error) {
      console.error("❌ Error in caller:", error);
    }
  };

  // Callee với error handling
  const callee = async (roomId: string, callerId: string) => {
    try {
      const stream = await initStream();
      if (!stream) {
        console.error("❌ Failed to initialize local stream for callee");
        return;
      }
      
      createPeerConnection(roomId, callerId, stream);
    } catch (error) {
      console.error("❌ Error in callee:", error);
    }
  };

  // Attempt reconnection với error handling
  const attemptReconnection = async (peerId: string, roomId: string) => {
    try {
      const maxAttempts = 3;
      const currentAttempts = reconnectAttempts.current.get(peerId) || 0;
      
      if (currentAttempts >= maxAttempts) {
        console.error(`❌ Max reconnection attempts reached for peer ${peerId}`);
        return;
      }

      console.log(`🔄 Attempting reconnection ${currentAttempts + 1}/${maxAttempts} for peer ${peerId}`);
      reconnectAttempts.current.set(peerId, currentAttempts + 1);

      const delay = Math.pow(2, currentAttempts) * 1000;
      await new Promise(resolve => setTimeout(resolve, delay));

      const pc = peers.current.get(peerId);
      if (!pc || !localStream) {
        console.error(`❌ Cannot reconnect: missing resources for ${peerId}`);
        return;
      }

      pc.restartIce();
      const offer = await pc.createOffer({ iceRestart: true });
      await pc.setLocalDescription(offer);
      
      if (socketIo) {
        socketIo.emit("call:signal", {
          peerId: peerId,
          roomId,
          offer,
        });
      }
    } catch (error) {
      console.error(`❌ Error during reconnection for ${peerId}:`, error);
    }
  };

  // Cleanup peer với error handling
  const cleanupPeer = (peerId: string) => {
    try {
      const timer = reconnectTimers.current.get(peerId);
      if (timer) {
        clearTimeout(timer);
        reconnectTimers.current.delete(peerId);
      }
      
      reconnectAttempts.current.delete(peerId);
      
      const pc = peers.current.get(peerId);
      if (pc) {
        pc.close();
        peers.current.delete(peerId);
      }
    } catch (error) {
      console.error(`❌ Error cleaning up peer ${peerId}:`, error);
    }
  };

  // HangUp với error handling toàn diện
  const hangUp = () => {
    try {
      console.log("🔚 Starting hangup process...");
      
      // Clear tất cả timers
      reconnectTimers.current.forEach((timer) => {
        try {
          clearTimeout(timer);
        } catch (error) {
          console.error("❌ Error clearing timer:", error);
        }
      });
      reconnectTimers.current.clear();
      
      // Clear reconnect attempts
      reconnectAttempts.current.clear();
      
      // Dừng local stream
      if (localStream) {
        localStream.getTracks().forEach((track) => {
          try {
            track.stop();
          } catch (error) {
            console.error("❌ Error stopping local track:", error);
          }
        });
      }
      
      // Dừng remote stream
      if (remoteStream) {
        remoteStream.getTracks().forEach((track) => {
          try {
            track.stop();
          } catch (error) {
            console.error("❌ Error stopping remote track:", error);
          }
        });
      }
      
      // Đóng tất cả peer connections
      peers.current.forEach((pc, peerId) => {
        try {
          pc.getSenders().forEach(sender => {
            if (sender.track) {
              sender.track.stop();
            }
          });
          
          pc.getReceivers().forEach(receiver => {
            if (receiver.track) {
              receiver.track.stop();
            }
          });
          
          pc.close();
        } catch (error) {
          console.error(`❌ Error closing peer connection ${peerId}:`, error);
        }
      });
      
      peers.current.clear();
      pendingCandidates.clear();
      
      // Reset state
      setLocalStream(null);
      setRemoteStream(null);
      setIsInitialized(false);
      
      // Cleanup socket listeners
      if (socketIo) {
        try {
          socketIo.off("client:signal");
        } catch (error) {
          console.error("❌ Error removing socket listeners:", error);
        }
      }
      
      // Stop InCallManager
      try {
        InCallManager.stop();
      } catch (error) {
        console.error("❌ Error stopping InCallManager:", error);
      }
      
      console.log("✅ Hangup completed");
    } catch (error) {
      console.error("❌ Critical error in hangUp:", error);
    }
  };

  // Toggle functions với error handling
  const toggleMute = () => {
    try {
      if (!localStream) return;

      const audioTracks = localStream.getAudioTracks();
      if (audioTracks.length === 0) return;

      const newMutedState = !isMuted;
      
      audioTracks.forEach((track) => {
        track.enabled = !newMutedState;
      });
      
      setIsMuted(newMutedState);
    } catch (error) {
      console.error("❌ Error toggling mute:", error);
    }
  };

  const toggleSpeaker = () => {
    try {
      const newSpeakerState = !isSpeakerOn;
      InCallManager.setSpeakerphoneOn(newSpeakerState);
      setIsSpeakerOn(newSpeakerState);
    } catch (error) {
      console.error("❌ Error toggling speaker:", error);
    }
  };

  const toggleVideo = () => {
    try {
      if (!localStream) return;

      const videoTracks = localStream.getVideoTracks();
      if (videoTracks.length === 0) return;

      const newVideoState = !isVideoOff;
      
      videoTracks.forEach((track) => {
        track.enabled = !newVideoState;
      });
      
      setIsVideoOff(newVideoState);
    } catch (error) {
      console.error("❌ Error toggling video:", error);
    }
  };

  const switchCamera = () => {
    try {
      if (!localStream) return;

      const videoTracks = localStream.getVideoTracks();
      videoTracks.forEach((track: any) => {
        if (track._switchCamera) {
          track._switchCamera();
        }
      });
    } catch (error) {
      console.error("❌ Error switching camera:", error);
    }
  };

  // Listen call với error handling
  const listenCall = () => {
    try {
      if (!socketIo) {
        console.error("❌ Socket not available");
        return;
      }

      const handleSignal = async ({ metadata }: any) => {
        try {
          const { peerId, roomId, offer, answer, candidate } = metadata;
          
          if (!peerId || !roomId) {
            console.error("❌ Invalid signal: missing peerId or roomId");
            return;
          }

          let pc = peers.current.get(peerId);
          if (!pc) {
            const stream = localStream || await initStream();
            if (!stream) return;
            
            const createdPc = createPeerConnection(roomId, peerId, stream);
            if (!createdPc) return;
            pc = createdPc;
          }

          if (offer) {
            await pc.setRemoteDescription(new RTCSessionDescription(offer));
            
            const pendingCands = pendingCandidates.get(peerId) || [];
            for (const candidate of pendingCands) {
              await pc.addIceCandidate(new RTCIceCandidate(candidate));
            }
            pendingCandidates.delete(peerId);
            
            const answerDesc = await pc.createAnswer();
            await pc.setLocalDescription(answerDesc);
            
            socketIo.emit("call:signal", {
              peerId: peerId,
              roomId,
              answer: answerDesc,
            });
          }

          if (answer) {
            await pc.setRemoteDescription(new RTCSessionDescription(answer));
            
            const pendingCands = pendingCandidates.get(peerId) || [];
            for (const candidate of pendingCands) {
              await pc.addIceCandidate(new RTCIceCandidate(candidate));
            }
            pendingCandidates.delete(peerId);
          }

          if (candidate) {
            if (pc.remoteDescription) {
              await pc.addIceCandidate(new RTCIceCandidate(candidate));
            } else {
              const queue = pendingCandidates.get(peerId) || [];
              queue.push(candidate);
              pendingCandidates.set(peerId, queue);
            }
          }
        } catch (error) {
          console.error("❌ Error handling signal:", error);
        }
      };

      socketIo.off("client:signal");
      socketIo.on("client:signal", handleSignal);
    } catch (error) {
      console.error("❌ Error setting up listen call:", error);
    }
  };

  return {
    localStream,
    remoteStream,
    isMuted,
    isSpeakerOn,
    isVideoOff,
    isInitialized,
    initStream,
    caller,
    callee,
    hangUp,
    toggleMute,
    toggleSpeaker,
    toggleVideo,
    switchCamera,
    listenCall,
  };
};
