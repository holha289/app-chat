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
  const [isVideoCall, setIsVideoCall] = useState(false);
  const [connectState, setConnectState] = useState('disconnected');
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const socketIo = getSocket();
  const localStreamRef = useRef<MediaStream | null>(null);
  const pendingOffer = useRef<RTCSessionDescription | null>(null);
  const pendingCandidates = useRef<Map<string, RTCIceCandidate[]>>(new Map());
  const pcRef = useRef<RTCPeerConnection | null>(null);

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
      InCallManager.start({ media: isVideoCall ? 'video' : 'audio', auto: true, ringback: '_DEFAULT_' });
      return stream;
    } catch (err) {
      console.error("❌ Error init media:", err);
      return null;
    }
  };

  const createPeerConnection = (roomId: string) => {
    pcRef.current = new RTCPeerConnection(pcConfig);

    pcRef.current.onicecandidate = (event) => {
      if (event.candidate) {
        console.log("✅ New ICE candidate:", event.candidate);
        socketIo?.emit("call:signal", {
          roomId,
          candidate: event.candidate,
        });
      }
    };

    pcRef.current.ontrack = (event) => {
      if (event.streams && event.streams[0]) {
        const stream = event.streams[0];
        console.log("✅ Remote stream received, tracks:", stream.getTracks());
        setRemoteStream(stream as any);
      }
    };


    return pcRef.current;
  }

  const handleCreateOffer = async (roomId: string) => {
    const stream = await initStream();
    if (!stream) {
      console.error("❌ Failed to initialize local stream for caller");
      return;
    }
    // Tạo peer connection và gửi lời mời
    await createPeerConnection(roomId);
    // Thêm các track từ local stream vào peer connection
    stream.getTracks().forEach((track) => {
      console.log("✅ Adding track:", track.kind, track.id);
      pcRef.current?.addTrack(track, stream);
    });

    try {
      const offer = await pcRef.current?.createOffer({
        offerToReceiveVideo: true,
        offerToReceiveAudio: true,
        voiceActivityDetection: false,
      });
      await pcRef.current?.setLocalDescription(offer);
      socketIo?.emit("call:signal", {
        roomId,
        offer,
      });
    } catch (err) {
      console.error("❌ Error creating offer:", err);
    }
  };

  const flushPendingCandidates = async (roomId: string) => {
    const candidates = pendingCandidates.current.get(roomId);
    if (candidates && candidates.length > 0) {
      console.log(`✅ Flushing ${candidates.length} pending ICE candidates for room ${roomId}`);
      for (const candidate of candidates) {
        try {
          await pcRef.current?.addIceCandidate(candidate);
          console.log("✅ ICE candidate added from queue:", candidate);
        } catch (err) {
          console.error("❌ Error adding queued ICE candidate:", err);
        }
      }
      pendingCandidates.current.delete(roomId);
    }
  };

  const handleAcceptCall = async (roomId: string) => {
    try {
      const answerDesc = await pcRef.current?.createAnswer();
      await pcRef.current?.setLocalDescription(answerDesc);
      console.log("📤 Sending answer:", answerDesc);
      socketIo?.emit("call:signal", {
        roomId,
        answer: answerDesc,
      });
    } catch (error) {
      console.error("❌ Error creating answer:", error);
    }
  };

  const listenCall = () => {
    const handleSignal = async ({ metadata }: any) => {
      const { roomId, offer, answer, candidate, type } = metadata;
      if (!roomId) {
        console.error("❌ Invalid signal: missing roomId");
        return;
      }

      try {
        if (type === "offer") {
          // callee nhận offer
          await initStream();
          await createPeerConnection(roomId);

          if (pcRef.current) {
            await pcRef.current.setRemoteDescription(new RTCSessionDescription(offer));
            console.log("✅ Offer processed, remote description set");

            // add track local
            localStreamRef.current?.getTracks().forEach((track) => {
              pcRef.current?.addTrack(track, localStreamRef.current as MediaStream);
            });

            // flush pending
            await flushPendingCandidates(roomId);
            setConnectState("connecting");
          }
          return;
        }

        if (type === "answer") {
          // caller nhận answer
          if (pcRef.current) {
            await pcRef.current.setRemoteDescription(new RTCSessionDescription(answer));
            console.log("✅ Answer processed, remote description set");

            // flush pending
            await flushPendingCandidates(roomId);
            setConnectState("connected");
          }
          return;
        }

        if (type === "candidate" && candidate) {
          // luôn queue
          const iceCandidate = new RTCIceCandidate(candidate);
          if (!pendingCandidates.current.has(roomId)) {
            pendingCandidates.current.set(roomId, []);
          }
          pendingCandidates.current.get(roomId)!.push(iceCandidate);
          console.log("⏳ Candidate queued:", iceCandidate);
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

  const toggleVideo = async () => {
    setIsVideoEnabled((prev) => !prev);
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        console.log(`✅ Video track ${videoTrack.enabled ? 'enabled' : 'disabled'}`);
      }
    }
  };

  const toggleAudio = () => {
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
    setIsVideoCall,
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
