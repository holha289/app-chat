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
    // Thêm TURN server backup (nếu có)
    {
      urls: "turn:your-domain.com:3478",
      username: "webrtc",
      credential: "superSecretPassword",
    },
  ],
  iceCandidatePoolSize: 10,
  // Thêm cấu hình để xử lý mạng yếu
  iceTransportPolicy: 'all',
  bundlePolicy: 'max-bundle',
  rtcpMuxPolicy: 'require',
};

// Hàng đợi ICE khi remoteDescription chưa có
const pendingCandidates = new Map<string, RTCIceCandidateInit[]>();

export const useWebRTC = (isVideoCall: boolean) => {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [isVideoOff, setIsVideoOff] = useState(false);

  const peers = useRef<Map<string, RTCPeerConnection>>(new Map());
  const reconnectAttempts = useRef<Map<string, number>>(new Map());
  const reconnectTimers = useRef<Map<string, NodeJS.Timeout>>(new Map());
  const socketIo = getSocket();

  // Khởi tạo local stream
  const initStream = async () => {
    try {
      const ok = await requestMediaPermissions();
      if (!ok) {
        console.error("❌ User từ chối quyền Camera/Micro");
        return;
      }
      
      const stream = await mediaDevices.getUserMedia({
        audio: true,
        video: isVideoCall,
      });
      
      setLocalStream(stream);
      
      // Cài đặt InCallManager cho phù hợp với loại cuộc gọi
      InCallManager.start({ media: isVideoCall ? "video" : "audio" });

      return stream;
    } catch (err) {
      console.error("❌ Error init media:", err);
      return null;
    }
  };

  const createPeerConnection = (roomId: string, peerId: string, forceStream?: MediaStream) => {
    // Sử dụng stream được truyền vào nếu có, nếu không thì dùng localStream từ state
    const streamToUse = forceStream || localStream;
    
    // Kiểm tra xem đã có stream chưa
    if (!streamToUse) {
      console.error("❌ Cannot create peer connection: No stream available");
      throw new Error("No local stream available when creating peer connection");
    }
    
    const pc = new RTCPeerConnection(pcConfig);
    peers.current.set(peerId, pc);

    // Thêm local track
    streamToUse.getTracks().forEach((track) => {
      pc.addTrack(track, streamToUse);
    });

    // ICE Candidate
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socketIo?.emit("call:signal", {
          peerId: peerId,
          roomId,
          candidate: event.candidate,
        });
      }
    };

    // Enhanced connection state monitoring với auto recovery
    pc.oniceconnectionstatechange = () => {
      const attempts = reconnectAttempts.current.get(peerId) || 0;
      
      switch (pc.iceConnectionState) {
        case 'connected':
          console.log(`✅ WebRTC connected for peer ${peerId}`);
          // Reset reconnect attempts khi kết nối thành công
          reconnectAttempts.current.set(peerId, 0);
          // Clear timer nếu có
          const timer = reconnectTimers.current.get(peerId);
          if (timer) {
            clearTimeout(timer);
            reconnectTimers.current.delete(peerId);
          }
          break;
          
        case 'disconnected':
          console.log(`⚠️ WebRTC disconnected for peer ${peerId} - will attempt reconnection`);
          // Đợi một chút trước khi reconnect (có thể là disconnect tạm thời)
          const disconnectTimer = setTimeout(() => {
            if (pc.iceConnectionState === 'disconnected') {
              attemptReconnection(peerId, roomId);
            }
          }, 3000); // Đợi 3 giây
          reconnectTimers.current.set(peerId, disconnectTimer);
          break;
          
        case 'failed':
          console.error(`❌ WebRTC connection failed for peer ${peerId} (attempt ${attempts + 1})`);
          attemptReconnection(peerId, roomId);
          break;
          
        case 'closed':
          console.log(`🔴 WebRTC connection closed for peer ${peerId}`);
          // Cleanup cho peer này
          cleanupPeer(peerId);
          break;
      }
    };

    // Monitoring connection state
    pc.onconnectionstatechange = () => {
      console.log(`🔗 Connection State for ${peerId}:`, pc.connectionState);
      
      if (pc.connectionState === 'failed') {
        console.error(`❌ Peer connection failed for ${peerId}`);
        attemptReconnection(peerId, roomId);
      }
    };

    // Monitoring ICE gathering state
    pc.onicegatheringstatechange = () => {
      console.log(`🧊 ICE Gathering State for ${peerId}:`, pc.iceGatheringState);
    };

    // Remote track
    pc.ontrack = (event) => {
      if (event.streams && event.streams[0]) {
        const stream = event.streams[0];
        
        // Kiểm tra tracks có enabled và readyState là 'live'
        const liveTracks = stream.getTracks().filter(track => 
          track.enabled && track.readyState === 'live'
        );
        
        if (liveTracks.length > 0) {
          setRemoteStream(stream as any);
        } else {
          // Đợi tracks sẵn sàng với timeout
          const checkTracksReady = () => {
            const readyTracks = stream.getTracks().filter(track => 
              track.enabled && track.readyState === 'live'
            );
            
            if (readyTracks.length > 0) {
              setRemoteStream(stream as any);
            } else {
              setTimeout(checkTracksReady, 100);
            }
          };
          
          setTimeout(checkTracksReady, 100);
        }
      }
    };

    return pc;
  };

  // Caller: tạo offer và gửi
  const caller = async (roomId: string, calleeId: string) => {
    const stream = await initStream();
    if (!stream) {
      console.error("❌ Failed to initialize local stream for caller");
      return;
    }
    
    try {
      // Truyền trực tiếp stream vào createPeerConnection để tránh vấn đề với state
      const pc = createPeerConnection(roomId, calleeId, stream);
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      socketIo?.emit("call:signal", {
        peerId: calleeId,
        roomId,
        offer,
      });
    } catch (error) {
      console.error("❌ Error creating/sending offer:", error);
    }
  };

  // Callee: chấp nhận lời mời và chuẩn bị nhận offer
  const callee = async (roomId: string, callerId: string) => {
    // Đảm bảo khởi tạo localStream thành công trước khi tạo peer connection
    const stream = await initStream();
    if (!stream) {
      console.error("❌ Failed to initialize local stream for callee");
      return;
    }
    // Truyền trực tiếp stream vào createPeerConnection để tránh vấn đề với state
    createPeerConnection(roomId, callerId, stream);
    // Offer sẽ được xử lý trong listenCall
  };

  // Function để thử reconnect
  const attemptReconnection = async (peerId: string, roomId: string) => {
    const maxAttempts = 3;
    const currentAttempts = reconnectAttempts.current.get(peerId) || 0;
    
    if (currentAttempts >= maxAttempts) {
      console.error(`❌ Max reconnection attempts (${maxAttempts}) reached for peer ${peerId}`);
      // Có thể thông báo cho user hoặc đóng cuộc gọi
      return;
    }

    console.log(`🔄 Attempting reconnection ${currentAttempts + 1}/${maxAttempts} for peer ${peerId}`);
    reconnectAttempts.current.set(peerId, currentAttempts + 1);

    try {
      // Đợi một chút trước khi thử lại (exponential backoff)
      const delay = Math.pow(2, currentAttempts) * 1000; // 1s, 2s, 4s
      await new Promise(resolve => setTimeout(resolve, delay));

      const pc = peers.current.get(peerId);
      if (!pc || !localStream) {
        console.error(`❌ Cannot reconnect: missing peer connection or local stream for ${peerId}`);
        return;
      }

      // Thử restart ICE trước
      console.log(`🧊 Restarting ICE for peer ${peerId}`);
      pc.restartIce();

      // Tạo offer mới với iceRestart
      const offer = await pc.createOffer({ iceRestart: true });
      await pc.setLocalDescription(offer);
      
      socketIo?.emit("call:signal", {
        peerId: peerId,
        roomId,
        offer,
      });

      console.log(`📤 Sent restart offer for peer ${peerId}`);

    } catch (error) {
      console.error(`❌ Error during reconnection attempt for ${peerId}:`, error);
      
      // Nếu restart ICE thất bại, thử tạo peer connection mới
      if (currentAttempts === maxAttempts - 1) {
        console.log(`🔄 Last attempt: recreating peer connection for ${peerId}`);
        await recreatePeerConnection(peerId, roomId);
      }
    }
  };

  // Function để tạo lại peer connection hoàn toàn mới
  const recreatePeerConnection = async (peerId: string, roomId: string) => {
    try {
      console.log(`🏗️ Recreating peer connection for ${peerId}`);
      
      // Đóng connection cũ
      const oldPc = peers.current.get(peerId);
      if (oldPc) {
        oldPc.close();
        peers.current.delete(peerId);
      }

      // Tạo connection mới
      if (localStream) {
        const newPc = createPeerConnection(roomId, peerId, localStream);
        
        // Tạo offer mới
        const offer = await newPc.createOffer();
        await newPc.setLocalDescription(offer);
        
        socketIo?.emit("call:signal", {
          peerId: peerId,
          roomId,
          offer,
        });

        console.log(`✅ Successfully recreated peer connection for ${peerId}`);
      }
    } catch (error) {
      console.error(`❌ Error recreating peer connection for ${peerId}:`, error);
    }
  };

  // Function để cleanup peer
  const cleanupPeer = (peerId: string) => {
    // Clear timers
    const timer = reconnectTimers.current.get(peerId);
    if (timer) {
      clearTimeout(timer);
      reconnectTimers.current.delete(peerId);
    }
    
    // Clear reconnect attempts
    reconnectAttempts.current.delete(peerId);
    
    // Remove peer connection
    peers.current.delete(peerId);
  };

  // Cleanup call
  const hangUp = () => {
    // Clear tất cả timers
    reconnectTimers.current.forEach((timer) => {
      clearTimeout(timer);
    });
    reconnectTimers.current.clear();
    
    // Clear reconnect attempts
    reconnectAttempts.current.clear();
    
    // 1. Dừng tất cả tracks trong localStream
    if (localStream) {
      localStream.getTracks().forEach((track) => {
        track.stop();
      });
    }
    
    // 2. Dừng tất cả tracks trong remoteStream (nếu có)
    if (remoteStream) {
      remoteStream.getTracks().forEach((track) => {
        track.stop();
      });
    }
    
    // 3. Đóng tất cả peer connections và cleanup
    peers.current.forEach((pc, peerId) => {
      cleanupPeer(peerId);
      
      // Dừng tất cả senders
      pc.getSenders().forEach(sender => {
        if (sender.track) {
          sender.track.stop();
        }
      });
      
      // Dừng tất cả receivers
      pc.getReceivers().forEach(receiver => {
        if (receiver.track) {
          receiver.track.stop();
        }
      });
      
      pc.close();
    });
    
    // 4. Clear peer connections map
    peers.current.clear();
    
    // 5. Clear pending candidates
    pendingCandidates.clear();
    
    // 6. Reset state
    setLocalStream(null);
    setRemoteStream(null);
    
    // 7. Cleanup socket listeners
    if (socketIo) {
      socketIo.off("client:signal");
    }
    
    // 8. Stop InCallManager
    try {
      InCallManager.stop();
    } catch (error) {
      console.error("❌ Error stopping InCallManager:", error);
    }
  };

  const toggleMute = () => {
    if (!localStream) {
      console.error("❌ No local stream to mute/unmute");
      return;
    }

    const audioTracks = localStream.getAudioTracks();
    if (audioTracks.length === 0) {
      console.error("❌ No audio tracks found");
      return;
    }

    const newMutedState = !isMuted;
    
    // Tắt/bật audio tracks
    audioTracks.forEach((track) => {
      track.enabled = !newMutedState;
    });
    
    // Cập nhật state
    setIsMuted(newMutedState);
    
    // Thông báo cho tất cả peers về trạng thái mute
    peers.current.forEach((pc, peerId) => {
      const sender = pc.getSenders().find(s => 
        s.track && s.track.kind === 'audio'
      );
      
      if (sender && sender.track) {
        sender.track.enabled = !newMutedState;
      }
    });
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
    if (!localStream) {
      console.error("❌ No local stream to toggle video");
      return;
    }

    const videoTracks = localStream.getVideoTracks();
    if (videoTracks.length === 0) {
      console.error("❌ No video tracks found");
      return;
    }

    const newVideoState = !isVideoOff;
    
    videoTracks.forEach((track) => {
      track.enabled = !newVideoState;
    });
    
    // Cập nhật state
    setIsVideoOff(newVideoState);
    
    // Cập nhật cho tất cả peers
    peers.current.forEach((pc, peerId) => {
      const sender = pc.getSenders().find(s => 
        s.track && s.track.kind === 'video'
      );
      
      if (sender && sender.track) {
        sender.track.enabled = !newVideoState;
      }
    });
  };

  const switchCamera = () => {
    if (!localStream) {
      console.error("❌ No local stream to switch camera");
      return;
    }

    const videoTracks = localStream.getVideoTracks();
    if (videoTracks.length === 0) {
      console.error("❌ No video tracks found");
      return;
    }

    videoTracks.forEach((track: any) => {
      if (track._switchCamera) {
        track._switchCamera();
      }
    });
  };

  // Lắng nghe tín hiệu 1 lần duy nhất
  const listenCall = () => {
    if (!socketIo) {
      console.error("❌ Socket not available when trying to listen for call signals");
      return;
    }

    const handleSignal = async ({ metadata }: any) => {
      const { peerId, roomId, offer, answer, candidate } = metadata;
      
      // Kiểm tra các giá trị bắt buộc
      if (!peerId || !roomId) {
        console.error("❌ Invalid signal: missing peerId or roomId");
        return;
      }
      // Lấy hoặc tạo peer connection
      let pc = peers.current.get(peerId);
      if (!pc) {
        // Đảm bảo đã khởi tạo localStream trước
        if (!localStream) {
          const stream = await initStream();
          if (!stream) {
            return; // Không tiếp tục nếu không thể khởi tạo stream
          }
          // Tạo peer connection với stream mới lấy được
          pc = createPeerConnection(roomId, peerId, stream);
        } else {
          // Sử dụng localStream đã có
          pc = createPeerConnection(roomId, peerId, localStream);
        }
      }

      if (offer) {
        try {
          await pc.setRemoteDescription(new RTCSessionDescription(offer));
          // Xử lý các ICE candidate đang chờ
          const pendingCands = pendingCandidates.get(peerId) || [];
          if (pendingCands.length > 0) {
            for (const candidate of pendingCands) {
              await pc.addIceCandidate(new RTCIceCandidate(candidate));
            }
            pendingCandidates.delete(peerId);
          }
          const answerDesc = await pc.createAnswer();
          await pc.setLocalDescription(answerDesc);
          socketIo.emit("call:signal", {
            peerId: peerId,
            roomId,
            answer: answerDesc,
          });
        } catch (error) {
          console.error("❌ Error processing offer:", error);
        }
      }

      if (answer) {
        try {
          await pc.setRemoteDescription(new RTCSessionDescription(answer));
          // Xử lý các ICE candidate đang chờ
          const pendingCands = pendingCandidates.get(peerId) || [];
          if (pendingCands.length > 0) {
            for (const candidate of pendingCands) {
              await pc.addIceCandidate(new RTCIceCandidate(candidate));
            }
            pendingCandidates.delete(peerId);
          }
        } catch (error) {
          console.error("❌ Error processing answer:", error);
        }
      }

      if (candidate) {
        try {
          if (pc.remoteDescription) {
            await pc.addIceCandidate(new RTCIceCandidate(candidate));
          } else {
            const queue = pendingCandidates.get(peerId) || [];
            queue.push(candidate);
            pendingCandidates.set(peerId, queue);
          }
        } catch (error) {
          console.error(`❌ Error processing ICE candidate for ${peerId}:`, error);
        }
      }
    };

    // Xóa listener cũ để tránh trùng lặp
    socketIo.off("client:signal");
    socketIo.on("client:signal", handleSignal);
  }

  return {
    localStream,
    remoteStream,
    isMuted,
    isSpeakerOn,
    isVideoOff,
    initStream,
    caller,
    callee,
    hangUp,
    toggleMute,
    toggleSpeaker,
    toggleVideo,
    switchCamera,
    listenCall,
    restartConnection: (peerId: string, roomId: string) => attemptReconnection(peerId, roomId),
  };
};
