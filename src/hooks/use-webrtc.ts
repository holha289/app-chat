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
    {
      urls: "turn:openrelay.metered.ca:443",
      username: "openrelayproject",
      credential: "openrelayproject",
    },
  ],
  iceCandidatePoolSize: 10,
  iceTransportPolicy: 'all',
  bundlePolicy: 'max-bundle',
  rtcpMuxPolicy: 'require',
};

export const useWebRTC = () => {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [connectState, setConnectState] = useState('disconnected');
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const socketIo = getSocket();
  const localStreamRef = useRef<MediaStream | null>(null);
  const pendingOffer = useRef<RTCSessionDescription | null>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const pendingCandidates = useRef<Map<string, RTCIceCandidate[]>>(new Map());

  const cleanUp = () => {
    if (pcRef.current) {
      pcRef.current.close();
      pcRef.current = null;
    }

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => {
        track.stop(); // dừng cả mic + camera
      });
      localStreamRef.current = null;
    }

    if (remoteStream) {
      remoteStream.getTracks().forEach(track => {
        track.stop(); // đảm bảo dừng audio của đối phương
      });
    }

    setLocalStream(null);
    setRemoteStream(null);

    InCallManager.stop(); // dừng audio manager
    InCallManager.setForceSpeakerphoneOn(false); // reset loa
    InCallManager.setMicrophoneMute(true); // mute mic
    console.log("✅ WebRTC cleanup completed");
  };

  useEffect(() => {
    socketIo?.on('connect', () => console.log("✅ Socket.IO connected"));
    socketIo?.on('connect_error', (err) => console.error("❌ Socket.IO error:", err));
    InCallManager.setSpeakerphoneOn(true);
    return () => {
      cleanUp();
    };
  }, []);

  // Khởi tạo local stream
  const initStream = async () => {
    if (localStreamRef.current) {
      console.log("✅ Stream already initialized:", localStreamRef.current.getTracks());
      return localStreamRef.current;
    }
    try {
      const ok = await requestMediaPermissions();
      console.log("✅ Permissions granted:", ok);
      if (!ok) {
        console.error("❌ User denied camera/mic permissions");
        return null;
      }

      const stream = await mediaDevices.getUserMedia({
        audio: true,
        video: isScreenSharing ? {
          facingMode: 'user',
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 30 }
        } : false
      });
      console.log("✅ Local stream tracks:", stream.getTracks());

      localStreamRef.current = stream;
      setLocalStream(stream);
      if (!isScreenSharing) {
        InCallManager.start({ media: "video", auto: true, ringback: "_DEFAULT_" });
        console.log("✅ InCallManager started");
      } else {
        InCallManager.start({ media: "audio", auto: true, ringback: "_DEFAULT_" });
      }
      return stream;
    } catch (err) {
      console.error("❌ Error init media:", err);
      return null;
    }
  };

  // Tạo peer connection
  const createPeerConnection = (roomId: string, peerId: string, stream: MediaStream): RTCPeerConnection | null => {
    const streamToUse = stream;
    try {
      // Tạo RTCPeerConnection mới nếu chưa có
      const pc = new RTCPeerConnection(pcConfig);
      pcRef.current = pc;
      // Thêm các track từ local stream vào peer connection
      streamToUse.getTracks().forEach((track) => {
        console.log("✅ Adding track:", track.kind, track.id);
        pc.addTrack(track, streamToUse);
      });

      // Sự kiện ICE candidate mới
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          console.log("✅ New ICE candidate:", event.candidate);
          socketIo?.emit("call:signal", {
            peerId: peerId,
            roomId,
            candidate: event.candidate,
          });
        } else {
          console.log("✅ All ICE candidates sent");
        }
      };

      // Sự kiện thay đổi trạng thái kết nối ICE
      pc.oniceconnectionstatechange = () => {
        console.log(`ICE Connection State for ${peerId}:`, pc.iceConnectionState);
        switch (pc.iceConnectionState) {
          case 'connected':
          case 'completed':
            console.log(`✅ WebRTC connected for peer ${peerId}`);
            setConnectState('connected');
            break;
          case 'disconnected':
            console.warn(`⚠️ WebRTC disconnected for peer ${peerId}`);
            setConnectState('disconnected');

            // Schedule reconnection attempt
            setTimeout(() => {
              if (pc.iceConnectionState === 'disconnected') {
                console.log(`🔄 Attempting to reconnect for peer ${peerId}`);
                pc.restartIce();
              }
            }, 2000);
            break;
          case 'failed':
            console.error(`❌ WebRTC connection failed for peer ${peerId}`);
            setConnectState('failed');
            break;
          case 'closed':
            console.log(`WebRTC connection closed for peer ${peerId}`);
            setConnectState('closed');
            break;
        }
      };

      // Sự kiện nhận track từ remote
      pc.ontrack = (event) => {
        if (event.streams && event.streams[0]) {
          const stream = event.streams[0];
          console.log("✅ Remote stream received, tracks:", stream.getTracks());
          setRemoteStream(stream as any);
        } else {
          console.error("❌ No remote stream received");
        }
      };
      return pc;
    } catch (err) {
      console.error("❌ Error creating peer connection:", err);
      return null;
    }
  };

  const handleCreateOffer = async (roomId: string, peerId: string) => {
    const stream = await initStream();
    if (!stream) {
      console.error("❌ Failed to initialize local stream for caller");
      return;
    }

    const pc = createPeerConnection(roomId, peerId, stream);
    if (!pc) {
      console.error("❌ Failed to create peer connection for caller");
      return;
    }

    try {
      const offer = await pc.createOffer({
        offerToReceiveVideo: true,
        offerToReceiveAudio: true,
        voiceActivityDetection: false,
      });
      await pc.setLocalDescription(offer);
      console.log("📤 Sending offer:", offer);
      socketIo?.emit("call:signal", {
        peerId: peerId,
        roomId,
        offer,
      });
    } catch (err) {
      console.error("❌ Error creating offer:", err);
    }
  };

  const handleAcceptCall = async (roomId: string, peerId: string) => {
    // peerId là id người gọi
    const stream = await initStream(); // Sử dụng hàm initStream để đảm bảo stream được khởi tạo đúng cách
    if (!stream) {
      console.error("❌ Failed to initialize local stream for callee");
      return;
    }
    // Tạo và gửi câu trả lời
    const pc = createPeerConnection(roomId, peerId, stream);
    if (!pc) {
      console.error("❌ Failed to create peer connection for callee");
      return;
    }

    if (!pendingOffer.current) {
      console.error("❌ No pending offer to accept");
      return;
    }
    await pc.setRemoteDescription(pendingOffer.current);
    pendingOffer.current = null;
    // Tạo và gửi câu trả lời
    InCallManager.stopRingback();  // dừng âm báo
    try {
      const answerDesc = await pc.createAnswer();
      await pc.setLocalDescription(answerDesc);
      console.log("📤 Sending answer:", answerDesc);
      socketIo?.emit("call:signal", {
        peerId: peerId,
        roomId,
        answer: answerDesc,
      });
      // flush ICE sau khi accept
      if (pendingCandidates.current.has(peerId)) {
        for (const cand of pendingCandidates.current.get(peerId)!) {
          await pc.addIceCandidate(new RTCIceCandidate(cand));
        }
        pendingCandidates.current.delete(peerId);
      }
    } catch (error) {
      console.error("❌ Error creating answer:", error);
    }
  };

  const listenCall = () => {
    const handleSignal = async ({ metadata }: any) => {
      if (!socketIo) {
        console.error("❌ No socket.io instance available");
        return;
      }
      console.log("📡 Received signal:", metadata);
      const { peerId, roomId, offer, answer, candidate } = metadata;

      if (!peerId || !roomId) {
        console.error("❌ Invalid signal: missing peerId or roomId");
        return;
      }

      try {
        if (offer) {
          // Nếu người gọi đến thiết lập kết nối mới cho người nhận
          pendingOffer.current = new RTCSessionDescription(offer);
          return;
        }

        if (answer) {
          InCallManager.stopRingback();  // dừng âm báo
          // Người gọi xử lý câu trả lời từ người nhận
          const pc = pcRef.current;
          if (!pc) {
            console.error("❌ No peer connection for answer from", peerId);
            return;
          }
          // Thiết lập mô tả từ xa
          await pc.setRemoteDescription(new RTCSessionDescription(answer));
        }
        // Xử lý ICE candidate mới
        if (candidate) {
          const pc = pcRef.current;
          if (!pc || !pc.remoteDescription) {
            // lưu tạm nếu chưa accept
            if (!pendingCandidates.current.has(peerId)) {
              pendingCandidates.current.set(peerId, []);
            }
            pendingCandidates.current.get(peerId)!.push(candidate);
            console.log("📥 Candidate queued:", candidate);
          } else {
            await pc.addIceCandidate(new RTCIceCandidate(candidate));
            console.log("✅ Candidate added immediately");
          }
        }
      } catch (err) {
        console.error("❌ Error processing signal:", err);
      }
    };

    socketIo?.off("client:signal");
    socketIo?.on("client:signal", handleSignal);
  };

  const hangOut = () => {
    cleanUp();
    setConnectState('disconnected');
  };

  const toggleVideo = async (roomId: string) => {
    setIsVideoEnabled((prev) => !prev);
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        console.log(`✅ Video track ${videoTrack.enabled ? 'enabled' : 'disabled'}`);
      }
    }
  };

  const toggleAudio = (roomId: string) => {
    setIsAudioEnabled((prev) => !prev);
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        console.log(`✅ Audio track ${audioTrack.enabled ? 'enabled' : 'disabled'}`);
      }
    }
  };

  return {
    localStream,
    remoteStream,
    initStream,
    listenCall,
    setIsScreenSharing,
    handleCreateOffer,
    connectState,
    hangOut,
    toggleVideo,
    toggleAudio,
    isVideoEnabled,
    isAudioEnabled,
    handleAcceptCall
  };
};
