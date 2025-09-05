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
  const pendingCandidates = useRef<Map<string, RTCIceCandidate[]>>(new Map());
  const peerIdRef = useRef<Map<string, RTCPeerConnection>>(new Map()); // roomId -> peerId
  const pcRef = useRef<RTCPeerConnection | null>(null);

  const cleanUp = () => {
    if (peerIdRef.current) {
      peerIdRef.current.forEach((peerConnection, roomId) => {
        console.log(`Cleaning up peer connection for room ${roomId}`);
        peerConnection.close();
      });
      peerIdRef.current.clear();
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
        video: {
          facingMode: 'user',
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 30 }
        }
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

  const handleCreateOffer = async (roomId: string, peerId: string) => {
    const stream = await initStream();
    if (!stream) {
      console.error("❌ Failed to initialize local stream for caller");
      return;
    }
    // Tạo peer connection và gửi lời mời
    pcRef.current = new RTCPeerConnection(pcConfig);
    peerIdRef.current.set(peerId, pcRef.current);
    // Thêm các track từ local stream vào peer connection
    stream.getTracks().forEach((track) => {
      console.log("✅ Adding track:", track.kind, track.id);
      pcRef.current?.addTrack(track, stream);
    });

    pcRef.current.onconnectionstatechange = () => {
      switch (pcRef.current?.connectionState) {
        case "connected":
          console.log("✅ Connection established");
          break;
        case "disconnected":
        case "failed":
          console.warn("⚠️ Connection failed/disconnected");
          cleanUp();
          setConnectState('disconnected');
          break;
        case "closed":
          console.log("ℹ️ Connection closed");
          cleanUp();
          setConnectState('disconnected');
          break;
        default:
          break;
      }
    };

    // Sự kiện ICE candidate mới
    pcRef.current.onicecandidate = (event) => {
      if (event.candidate) {
        console.log("✅ New ICE candidate:", event.candidate);
        socketIo?.emit("call:signal", {
          peerId: peerId, // gửi về máy 2
          roomId,
          candidate: event.candidate,
        });
      } else {
        console.log("✅ All ICE candidates sent");
      }
    };

    // Sự kiện nhận track từ remote
    pcRef.current.ontrack = (event) => {
      if (event.streams && event.streams[0]) {
        const stream = event.streams[0];
        console.log("✅ Remote stream received, tracks:", stream.getTracks());
        setRemoteStream(stream as any);
      }
    };

    try {
      const offer = await pcRef.current.createOffer({
        offerToReceiveVideo: true,
        offerToReceiveAudio: true,
        voiceActivityDetection: false,
      });
      await pcRef.current.setLocalDescription(offer);
      // Gửi lời mời về máy 2
      socketIo?.emit("call:signal", {
        peerId: peerId,
        roomId,
        offer,
      });
    } catch (err) {
      console.error("❌ Error creating offer:", err);
    }
  };

  const handleAcceptCall = async (roomId: string, peerId: string, callerId: string) => {
    // Sụ kiện máy 2 nhận lời mời
    const stream = await initStream();
    if (!stream) {
      console.error("❌ Failed to initialize local stream for callee");
      return;
    }
    pcRef.current = new RTCPeerConnection(pcConfig);
    peerIdRef.current.set(peerId, pcRef.current);
    // Thêm các track từ local stream vào peer connection
    stream.getTracks().forEach((track) => {
      console.log("✅ Adding track:", track.kind, track.id);
      pcRef.current?.addTrack(track, stream);
    });

    pcRef.current.onconnectionstatechange = () => {
      switch (pcRef.current?.connectionState) {
        case "connected":
          console.log("✅ Connection established");
          setConnectState('connected');
          break;
        case "disconnected":
        case "failed":
          console.warn("⚠️ Connection failed/disconnected");
          cleanUp();
          setConnectState('disconnected');
          break;
        case "closed":
          console.log("ℹ️ Connection closed");
          cleanUp();
          setConnectState('disconnected');
          break;
        default:
          break;
      }
    };

    pcRef.current.onicecandidate = (event) => {
      if (event.candidate) {
        console.log("✅ New ICE candidate:", event.candidate);
        socketIo?.emit("call:signal", {
          peerId: callerId, // gửi về máy 1
          roomId,
          candidate: event.candidate,
        });
      } else {
        console.log("✅ All ICE candidates sent");
      }
    };

    pcRef.current.ontrack = (event) => {
      if (event.streams && event.streams[0]) {
        const stream = event.streams[0];
        console.log("✅ Remote stream received, tracks:", stream.getTracks());
        setRemoteStream(stream as any);
      }
    };

    if (!pendingOffer.current) {
      console.error("❌ No pending offer to accept");
      return;
    }
    // Thiết lập mô tả từ xa 
    await pcRef.current.setRemoteDescription(pendingOffer.current);
    pendingOffer.current = null;
    // Các ICE candidate chờ
    if (pendingCandidates.current.has(peerId)) {
      const candidates = pendingCandidates.current.get(peerId);
      if (candidates && candidates.length > 0) {
        for (const c of candidates) {
          await pcRef.current.addIceCandidate(new RTCIceCandidate(c));
          console.log("✅ Pending candidate added:", c);
        }
      }
      pendingCandidates.current.delete(peerId);
    }
    // Tạo và gửi câu trả lời
    InCallManager.stopRingback();  // dừng âm báo
    try {
      const answerDesc = await pcRef.current.createAnswer();
      await pcRef.current.setLocalDescription(answerDesc);
      console.log("📤 Sending answer:", answerDesc);
      socketIo?.emit("call:signal", {
        peerId: callerId, // gửi về máy 1
        roomId,
        answer: answerDesc,
      });
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
      const { peerId, roomId, offer, answer, candidate, type } = metadata;
      if (!peerId || !roomId) {
        console.error("❌ Invalid signal: missing peerId or roomId");
        return;
      }

      try {
        if (type && type === 'offer') {
          // Nếu người gọi đến thiết lập kết nối mới cho người nhận
          pendingOffer.current = new RTCSessionDescription(offer);
          return;
        }

        if (type && type === 'answer') {
          InCallManager.stopRingback();  // dừng âm báo
          // peerId là id người gọi, để lấy đúng peer connection
          const pc = peerIdRef.current.get(peerId);
          if (!pc) {
            console.error("❌ No peer connection for answer from", peerId);
            return;
          }
          // Thiết lập mô tả từ xa
          await pc.setRemoteDescription(new RTCSessionDescription(answer));
          // Các ICE candidate chờ
          if (pendingCandidates.current.has(peerId)) {
            const candidates = pendingCandidates.current.get(peerId);
            if (candidates && candidates.length > 0) {
              for (const c of candidates) {
                await pc.addIceCandidate(new RTCIceCandidate(c));
                console.log("✅ Pending candidate added:", c);
              }
            }
            pendingCandidates.current.delete(peerId);
          }
          return;
        }
        // Xử lý ICE candidate mới
        if (type && type === 'candidate' && candidate) {
          const pc = peerIdRef.current.get(peerId); // peerId là người GỬI
          const candInit = candidate; // object JSON

          if (!pc) {
            // Chưa có PC -> queue theo fromPeer
            if (!pendingCandidates.current.has(peerId)) pendingCandidates.current.set(peerId, []);
            pendingCandidates.current.get(peerId)!.push(candInit);
            console.log("📥 Candidate queued (no PC yet) from:", peerId);
            return;
          }

          if (!pc.remoteDescription) {
            if (!pendingCandidates.current.has(peerId)) pendingCandidates.current.set(peerId, []);
            pendingCandidates.current.get(peerId)!.push(candInit);
            console.log("📥 Candidate queued (no remoteDescription) from:", peerId);
            return;
          }

          // ✅ Có PC và đã setRemoteDescription -> add luôn
          try {
            await pc.addIceCandidate(new RTCIceCandidate(candInit));
            console.log("✅ addIceCandidate immediately:", candInit);
          } catch (e) {
            console.warn("⚠️ addIceCandidate failed, re-queue:", e);
            if (!pendingCandidates.current.has(peerId)) pendingCandidates.current.set(peerId, []);
            pendingCandidates.current.get(peerId)!.push(candInit);
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
