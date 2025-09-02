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
import { Socket } from "socket.io-client";

const pcConfig: RTCConfiguration = {
  iceServers: [
    { urls: ["stun:stun.l.google.com:19302"] },
    { urls: ["stun:stun1.l.google.com:19302"] },
    { urls: ["stun:stun2.l.google.com:19302"] },
    // Comment out TURN server nếu không có
    {
      urls: "turn:your-domain.com:3478",
      username: "webrtc",
      credential: "superSecretPassword",
    },
  ],
  iceCandidatePoolSize: 10,
  iceTransportPolicy: 'all',
  bundlePolicy: 'max-bundle',
  rtcpMuxPolicy: 'require',
};

// Hàng đợi ICE khi remoteDescription chưa có
const pendingCandidates = new Map<string, RTCIceCandidateInit[]>();

export const useWebRTC = () => {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [connectState, setConnectState] = useState('disconnected');
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [localVideoTrack, setLocalVideoTrack] = useState<MediaStreamTrack | null>(null);
  const peers = useRef<Map<string, RTCPeerConnection>>(new Map());
  const socketIo = getSocket();
  // Sử dụng useRef để lưu trữ stream, tránh re-render không cần thiết
  const localStreamRef = useRef<MediaStream | null>(null);
  // Hàm cleanup để giải phóng tài nguyên
  const cleanUp = () => {
    peers.current.forEach((pc, peerId) => {
      pc.close();
      peers.current.delete(peerId);
    });

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
      localStreamRef.current = null;
    }

    setLocalStream(null);
    setRemoteStream(null);
    InCallManager.stop();
    console.log("✅ WebRTC cleanup completed");
  };

  useEffect(() => {
    // Return hàm cleanup
    return () => {
      cleanUp();
    };
  }, []);

  // Khởi tạo local stream với error handling tốt hơn
  const initStream = async () => {
    if (localStreamRef.current) {
      console.log("✅ Stream already initialized. Returning existing stream.");
      return localStreamRef.current;
    }
    try {
      // Xin quyền
      const ok = await requestMediaPermissions();
      if (!ok) {
        console.error("❌ User từ chối quyền Camera/Micro");
        return null;
      }

      const stream = await mediaDevices.getUserMedia({
        audio: true,
        video: isScreenSharing,
      });

      if (!stream) {
        console.error("❌ Failed to get media stream");
        return null;
      }

      localStreamRef.current = stream;
      setLocalStream(stream); // Lưu trữ stream cục bộ
      // Cài đặt InCallManager cho phù hợp với loại cuộc gọi
      try {
        InCallManager.start({ media: isScreenSharing ? "video" : "audio" });
      } catch (error) {
        console.error("❌ Error starting InCallManager:", error);
      }

      return stream;
    } catch (err) {
      console.error("❌ Error init media:", err);
      return null;
    }
  };

  const createPeerConnection = (roomId: string, peerId: string, stream: MediaStream | null) => {
    // Sử dụng stream được truyền vào nếu có
    const streamToUse = stream || localStreamRef.current;
    // Nếu không có stream, không thể tạo peer connection
    if (!streamToUse) {
      console.error("❌ Cannot create peer connection: No stream available");
      return null;
    }

    // Kiểm tra nếu peer connection đã tồn tại
    if (peers.current.has(peerId)) {
      return peers.current.get(peerId)!;
    }

    const pc = new RTCPeerConnection(pcConfig);
    peers.current.set(peerId, pc);

    // Thêm local track 
    streamToUse.getTracks().forEach((track) => pc.addTrack(track, streamToUse));

    // ICE candidate với error handling
    pc.onicecandidate = (event) => { // Gửi về 
      event.candidate && socketIo?.emit("call:signal", {
        peerId: peerId,
        roomId,
        candidate: event.candidate,
      });
    };

    // Bắt đầu theo dõi trạng thái kết nối ICE
    pc.oniceconnectionstatechange = () => {
      try {
        switch (pc.iceConnectionState) {
          case 'connected':
            console.log(`✅ WebRTC connected for peer ${peerId}`);
            setConnectState('connected');
            break;

          case 'disconnected':
            console.log(`⚠️ WebRTC disconnected for peer ${peerId}`);
            setConnectState('disconnected');
            break;

          case 'failed':
            setConnectState('failed');
            break;

          case 'closed':
            setConnectState('closed');
            break;
        }
      } catch (error) {
        console.error("❌ Error in ice connection state change:", error);
      }
    };

    // Remote track với error handling
    pc.ontrack = (event) => {
      if (event.streams && event.streams[0]) {
        const stream = event.streams[0];
        setRemoteStream(stream as any);
      }
    };

    return pc;
  };

  // Người gọi tạo offer và gửi đi
  const handleCaller = async (roomId: string, calleeId: string) => {
    let stream = localStreamRef.current || await initStream();
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
    // Tạo offer và gửi đi
    socketIo?.emit("call:signal", {
      peerId: calleeId,
      roomId,
      offer,
    });
  };

  // Người được gọi chỉ tạo stream
  const handleCallee = async (roomId: string, callerId: string) => {
    const stream = localStreamRef.current || await initStream();
    if (!stream) {
      console.error("❌ Failed to initialize local stream for callee");
      return;
    }

    createPeerConnection(roomId, callerId, stream);
  };

  // Listen call với error handling
  const listenCall = () => {
    const handleSignal = async ({ metadata }: any) => {
      const { peerId, roomId, offer, answer, candidate } = metadata;

      if (!peerId || !roomId) {
        console.error("❌ Invalid signal: missing peerId or roomId");
        return;
      }
      // Kiểm tra nếu peer connection đã tồn tại
      let pc = peers.current.get(peerId);
      if (!pc) {
        const stream = localStreamRef.current || await initStream();
        if (!stream) return;
        const createdPc = createPeerConnection(roomId, peerId, stream);
        if (!createdPc) return;
        pc = createdPc;
      }
      // Lắng nghe offer được tạo từ người gọi
      if (offer) {
        await pc.setRemoteDescription(new RTCSessionDescription(offer));

        const pendingCands = pendingCandidates.get(peerId) || [];
        for (const candidate of pendingCands) {
          await pc.addIceCandidate(new RTCIceCandidate(candidate));
        }
        pendingCandidates.delete(peerId);

        const answerDesc = await pc.createAnswer();
        await pc.setLocalDescription(answerDesc);

        socketIo?.emit("call:signal", {
          peerId: peerId,
          roomId,
          answer: answerDesc,
        });
      }

      // Lắng nghe answer được tạo từ người được gọi
      if (answer) {
        await pc.setRemoteDescription(new RTCSessionDescription(answer));

        const pendingCands = pendingCandidates.get(peerId) || [];
        for (const candidate of pendingCands) {
          await pc.addIceCandidate(new RTCIceCandidate(candidate));
        }
        pendingCandidates.delete(peerId);
      }

      // Lắng nghe candidate được tạo từ cả hai bên
      if (candidate) {
        if (pc.remoteDescription) {
          await pc.addIceCandidate(new RTCIceCandidate(candidate));
        } else {
          const queue = pendingCandidates.get(peerId) || [];
          queue.push(candidate);
          pendingCandidates.set(peerId, queue);
        }
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
    if (isVideoEnabled) {
      if (localVideoTrack) {
        localVideoTrack.enabled = false;
        // Gửi tín hiệu để báo cho peer kia rằng video đã tắt
        // (WebRTC tự động xử lý, nhưng có thể cần signaling tùy trường hợp)
      }
      setIsVideoEnabled(false);
    } else { // Nếu video đang tắt, thì bật
      try {
        // Yêu cầu một luồng video mới
        const videoStream = await mediaDevices.getUserMedia({ video: true });
        const newVideoTrack = videoStream.getVideoTracks()[0];

        // Lặp qua tất cả các peer connections và thêm track video mới vào
        peers.current.forEach((pc) => {
          pc.addTrack(newVideoTrack, localStreamRef.current!);
        });

        setLocalVideoTrack(newVideoTrack as any);
        setIsVideoEnabled(true);

        // Cập nhật lại localStream để UI có thể hiển thị
        if (localStreamRef.current) {
          localStreamRef.current.addTrack(newVideoTrack);
        }
        setLocalStream(localStreamRef.current);

      } catch (error) {
        console.error("❌ Failed to get video stream:", error);
      }
    }
  };

  const toggleAudio = () => {
    setIsAudioEnabled((prev) => !prev);
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
      }
    }
  };

  return {
    localStream,
    remoteStream,
    initStream,
    listenCall,
    setIsScreenSharing,
    handleCallee,
    handleCaller,
    connectState,
    hangOut,
    toggleVideo,
    toggleAudio,
    isVideoEnabled,
    isAudioEnabled
  };
};
