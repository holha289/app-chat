import { useEffect, useRef, useState } from "react";
import { getSocket } from "@app/core/socketIo";
import InCallManager from "react-native-incall-manager";
import {
  mediaDevices,
  RTCPeerConnection,
  RTCIceCandidate,
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

export const useWebRTC = ({
  roomId,
  fromUserId,
}: {
  roomId: string;
  fromUserId: string;
}) => {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [isVoiceOnly, setIsVoiceOnly] = useState(false);

  const peers = useRef<Map<string, RTCPeerConnection>>(new Map());
  const socketIo = getSocket();

  // Khởi tạo local stream
  const initStream = async () => {
    try {
      const ok = await requestMediaPermissions();
      if (!ok) {
        console.warn("❌ User từ chối quyền Camera/Micro");
        return;
      }

      const stream = await mediaDevices.getUserMedia({
        audio: true,
        video: !isVoiceOnly,
      });

      setLocalStream(stream);
      // Nếu muốn quản lý audio mode
      InCallManager.start({ media: isVoiceOnly ? "audio" : "video" });
    } catch (err) {
      console.error("Error init media:", err);
    }
  };

  const createPeerConnection = (peerId: string) => {
    const pc = new RTCPeerConnection(pcConfig);
    peers.current.set(peerId, pc);

    // Thêm local track
    localStream?.getTracks().forEach((track) => pc.addTrack(track, localStream));

    // ICE
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socketIo?.emit("call:signal", {
          to: peerId,
          from: fromUserId,
          roomId,
          candidate: event.candidate,
        });
      }
    };

    // Remote track
    pc.ontrack = (event: any) => {
      setRemoteStream(event.streams[0]);
    };

    return pc;
  };

  // Bắt đầu call
  const startCall = async (to: string) => {
    if (!localStream) return;
    const pc = createPeerConnection(to);

    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);

    try {
      await socketIo?.emit("call:signal", {
        to,
        from: fromUserId,
        roomId,
        offer,
      });
    } catch (error) {
      console.error("Error sending offer:", error);
    }
  };

  // Hang up call
  const hangUp = () => {
    if (localStream && typeof localStream.getTracks === "function") {
      localStream.getTracks().forEach((track) => {
        if (track && typeof track.stop === "function") {
          track.stop();
        }
      });
    }
    setLocalStream(null);
    setRemoteStream(null);
    InCallManager.stop();
  };

  const toggleMute = () => {
    if (!localStream) return;
    localStream.getAudioTracks().forEach((track) => (track.enabled = !track.enabled));
  };

  const toggleSpeaker = (isSpeakerOn: boolean) => {
    InCallManager.setSpeakerphoneOn(isSpeakerOn);
  };

  const toggleVideo = () => {
    if (!localStream) return;
    localStream.getVideoTracks().forEach((track) => (track.enabled = !track.enabled));
  };

  const switchCamera = () => {
    if (!localStream) return;
    localStream.getVideoTracks().forEach((track) => {
      track._switchCamera();
    });
  };

  // Lắng nghe tín hiệu từ socket
  useEffect(() => {
    if (!socketIo) return;

    socketIo.on("client:signal", async ({ from, offer, answer, candidate }) => {
      let pc = peers.current.get(from);

      if (!pc) {
        pc = createPeerConnection(from);
      }

      // Nếu nhận offer → trả lời bằng answer
      if (offer) {
        await pc.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        socketIo.emit("call:signal", { to: from, from: fromUserId, roomId, answer });
      }

      // Nếu nhận answer
      if (answer) {
        await pc.setRemoteDescription(new RTCSessionDescription(answer));
      }

      // Nếu nhận ICE candidate
      if (candidate) {
        if (pc.remoteDescription) {
          await pc.addIceCandidate(new RTCIceCandidate(candidate));
        } else {
          const queue = pendingCandidates.get(from) || [];
          queue.push(candidate);
          pendingCandidates.set(from, queue);
        }
      }
    });

    return () => {
      socketIo.off("client:signal");
    };
  }, [socketIo, localStream]);

  return {
    localStream,
    remoteStream,
    startCall,
    setIsVoiceOnly,
    initStream,

    // Hang up call
    hangUp,
    toggleMute,
    toggleSpeaker,
    toggleVideo,
    switchCamera,
  };
};
