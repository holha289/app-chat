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
    {
      urls: "turn:your-domain.com:3478",
      username: "webrtc",
      credential: "superSecretPassword",
    },
  ],
};

// Hàng đợi ICE khi remoteDescription chưa có
const pendingCandidates = new Map<string, RTCIceCandidateInit[]>();

export const useWebRTC = () => {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [isVoiceOnly, setIsVoiceOnly] = useState(false);

  const peers = useRef<Map<string, RTCPeerConnection>>(new Map());
  const socketIo = getSocket();

  // Debug useEffect to track remoteStream changes
  useEffect(() => {
    if (remoteStream) {
      console.log("🎮 RemoteStream set:", remoteStream.getTracks().map(t => ({ 
        kind: t.kind, 
        enabled: t.enabled,
        id: t.id 
      })));
    }
  }, [remoteStream]);

  // Khởi tạo local stream
  const initStream = async () => {
    try {
      const ok = await requestMediaPermissions();
      if (!ok) {
        console.warn("❌ User từ chối quyền Camera/Micro");
        return;
      }

      console.log("🎥 Getting user media with isVoiceOnly:", isVoiceOnly);
      
      // Nếu là cuộc gọi thoại (isVoiceOnly = true), chỉ yêu cầu quyền audio
      // Nếu là cuộc gọi video (isVoiceOnly = false), yêu cầu cả audio và video
      const stream = await mediaDevices.getUserMedia({
        audio: true,
        video: !isVoiceOnly,
      });

      console.log(`🎥 Setting localStream with ${stream.getTracks().length} tracks (isVoiceOnly: ${isVoiceOnly})`);
      console.log(`🎥 Tracks:`, stream.getTracks().map(t => ({ kind: t.kind, enabled: t.enabled })));
      
      setLocalStream(stream);
      
      // Cài đặt InCallManager cho phù hợp với loại cuộc gọi
      InCallManager.start({ media: isVoiceOnly ? "audio" : "video" });
      
      return stream;
    } catch (err) {
      console.error("❌ Error init media:", err);
      return null;
    }
  };

  const createPeerConnection = (roomId: string, peerId: string, forceStream?: MediaStream) => {
    console.log(`🔄 Creating peer connection for room ${roomId} with peer ${peerId}`);
    
    // Sử dụng stream được truyền vào nếu có, nếu không thì dùng localStream từ state
    const streamToUse = forceStream || localStream;
    
    // Kiểm tra xem đã có stream chưa
    if (!streamToUse) {
      console.error("❌ Cannot create peer connection: No stream available");
      throw new Error("No local stream available when creating peer connection");
    }
    
    const pc = new RTCPeerConnection(pcConfig);
    peers.current.set(peerId, pc);

    // Thêm local track - stream đã được kiểm tra ở trên
    console.log(`🎤 Adding ${streamToUse.getTracks().length} local tracks to peer connection`);
    streamToUse.getTracks().forEach((track) => {
      console.log(`🎤 Adding track: ${track.kind} (enabled: ${track.enabled})`);
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

    // Remote track
    pc.ontrack = (event) => {
      console.log(`🎵 Received remote track from ${peerId}:`, 
        event.streams ? event.streams.length : 0, 
        'streams');
      
      if (event.streams && event.streams[0]) {
        const stream = event.streams[0];
        console.log(`📺 Setting remote stream with ${stream.getTracks().length} tracks`);
        console.log(`📺 Remote stream tracks:`, stream.getTracks().map(t => ({ 
          kind: t.kind, 
          enabled: t.enabled,
          id: t.id,
          readyState: t.readyState
        })));
        
        // Kiểm tra tracks có enabled và readyState là 'live'
        const liveTracks = stream.getTracks().filter(track => 
          track.enabled && track.readyState === 'live'
        );
        
        if (liveTracks.length > 0) {
          console.log(`📺 Stream has ${liveTracks.length} live tracks, setting remote stream`);
          setRemoteStream(stream as any);
        } else {
          console.warn(`⚠️ Stream has no live tracks, waiting for tracks to be ready`);
          
          // Đợi tracks sẵn sàng với timeout
          const checkTracksReady = () => {
            const readyTracks = stream.getTracks().filter(track => 
              track.enabled && track.readyState === 'live'
            );
            
            if (readyTracks.length > 0) {
              console.log(`📺 Tracks are now ready, setting remote stream`);
              setRemoteStream(stream as any);
            } else {
              console.log(`📺 Still waiting for tracks to be ready...`);
              setTimeout(checkTracksReady, 100);
            }
          };
          
          setTimeout(checkTracksReady, 100);
        }
      } else {
        console.warn(`⚠️ Received track event without streams from ${peerId}`);
      }
    };

    // Log connection state changes
    (pc as any).oniceconnectionstatechange = () => {
      console.log(`🌐 ICE connection state: ${pc.iceConnectionState}`);
      
      // Nếu kết nối thành công, kiểm tra remote stream
      if (pc.iceConnectionState === 'connected' || pc.iceConnectionState === 'completed') {
        console.log(`✅ WebRTC connection established for peer ${peerId}`);
        
        // Kiểm tra và log remote streams từ receivers
        const receivers = pc.getReceivers();
        console.log(`📺 Remote receivers count: ${receivers.length}`);
        
        receivers.forEach((receiver: any, index: number) => {
          if (receiver.track) {
            console.log(`📺 Remote track ${index}:`, {
              kind: receiver.track.kind,
              enabled: receiver.track.enabled,
              readyState: receiver.track.readyState,
              muted: receiver.track.muted
            });
          }
        });
      }
      
      if (pc.iceConnectionState === 'failed' || pc.iceConnectionState === 'disconnected') {
        console.error(`❌ WebRTC connection failed/disconnected for peer ${peerId}`);
      }
    };

    return pc;
  };

  // Caller: tạo offer và gửi
  const caller = async (roomId: string, calleeId: string) => {
    console.log(`📞 Caller initiating call to ${calleeId} in room ${roomId}`);
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

  // Debug function để kiểm tra stream state
  const debugStreamState = () => {
    console.log("🔍 === STREAM DEBUG INFO ===");
    console.log("Local Stream:", {
      exists: !!localStream,
      tracks: localStream?.getTracks().map(t => ({
        kind: t.kind,
        enabled: t.enabled,
        readyState: t.readyState,
        muted: t.muted
      })) || []
    });
    
    console.log("Remote Stream:", {
      exists: !!remoteStream,
      tracks: remoteStream?.getTracks().map(t => ({
        kind: t.kind,
        enabled: t.enabled,
        readyState: t.readyState,
        muted: t.muted
      })) || []
    });
    
    console.log("Peer Connections:", peers.current.size);
    peers.current.forEach((pc, peerId) => {
      console.log(`Peer ${peerId}:`, {
        connectionState: pc.connectionState,
        iceConnectionState: pc.iceConnectionState,
        receivers: pc.getReceivers().length,
        senders: pc.getSenders().length
      });
    });
    console.log("🔍 === END DEBUG INFO ===");
  };

  // Cleanup call
  const hangUp = () => {
    if (localStream) {
      localStream.getTracks().forEach((t) => t.stop());
    }
    setLocalStream(null);
    setRemoteStream(null);
    peers.current.forEach((pc) => pc.close());
    peers.current.clear();
    InCallManager.stop();
  };

  // Toggle functions
  const toggleMute = () => {
    localStream?.getAudioTracks().forEach((t) => (t.enabled = !t.enabled));
  };

  const toggleSpeaker = (isSpeakerOn: boolean) => {
    InCallManager.setSpeakerphoneOn(isSpeakerOn);
  };

  const toggleVideo = () => {
    localStream?.getVideoTracks().forEach((t) => (t.enabled = !t.enabled));
  };

  const switchCamera = () => {
    localStream?.getVideoTracks().forEach((t: any) => {
      if (t._switchCamera) t._switchCamera();
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
      } else {
        console.log(`🔄 Using existing peer connection for ${peerId}`);
      }

      if (offer) {
        try {
          await pc.setRemoteDescription(new RTCSessionDescription(offer));
          // Xử lý các ICE candidate đang chờ
          const pendingCands = pendingCandidates.get(peerId) || [];
          if (pendingCands.length > 0) {
            console.log(`⚙️ Processing ${pendingCands.length} pending candidates`);
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
            console.log(`⚙️ Processing ${pendingCands.length} pending candidates for ${peerId}`);
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
    console.log("🎧 Now listening for WebRTC signals on client:signal event");
  }

  return {
    localStream,
    remoteStream,
    setIsVoiceOnly,
    initStream,
    caller,
    callee,
    hangUp,
    toggleMute,
    toggleSpeaker,
    toggleVideo,
    switchCamera,
    listenCall,
    debugStreamState
  };
};
