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
  iceTransportPolicy: 'relay',
  bundlePolicy: 'max-bundle',
  rtcpMuxPolicy: 'require',
};

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
  const localStreamRef = useRef<MediaStream | null>(null);

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
    socketIo?.on('connect', () => console.log("✅ Socket.IO connected"));
    socketIo?.on('connect_error', (err) => console.error("❌ Socket.IO error:", err));
    InCallManager.setSpeakerphoneOn(true);
    return () => {
      cleanUp();
    };
  }, []);

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
        video: isScreenSharing,
      });
      console.log("✅ Local stream tracks:", stream.getTracks());

      localStreamRef.current = stream;
      setLocalStream(stream);
      InCallManager.start({ media: "video", auto: true, ringback: "_DEFAULT_" });
      console.log("✅ InCallManager started");
      return stream;
    } catch (err) {
      console.error("❌ Error init media:", err);
      return null;
    }
  };

  const createPeerConnection = (roomId: string, peerId: string, stream: MediaStream | null) => {
    const streamToUse = stream || localStreamRef.current;
    if (!streamToUse) {
      console.error("❌ Cannot create peer connection: No stream available");
      return null;
    }

    if (peers.current.has(peerId)) {
      return peers.current.get(peerId)!;
    }

    const pc = new RTCPeerConnection(pcConfig);
    peers.current.set(peerId, pc);

    streamToUse.getTracks().forEach((track) => {
      console.log("✅ Adding track:", track);
      pc.addTrack(track, streamToUse);
    });

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
  };

  const handleCreateOffer = async (roomId: string, peerId: string) => {
    let pc: RTCPeerConnection | null | undefined = peers.current.get(peerId);
    if (!pc) {
      const stream = localStreamRef.current || await initStream();
      if (!stream) return;
      pc = createPeerConnection(roomId, peerId, stream);
      if (!pc) return;
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

  const handleStreamAndPeer = async (roomId: string, callerId: string) => {
    const stream = localStreamRef.current || await initStream();
    if (!stream) {
      console.error("❌ Failed to initialize local stream for callee");
      return;
    }

    createPeerConnection(roomId, callerId, stream);
  };

  const listenCall = () => {
    const handleSignal = async ({ metadata }: any) => {
      console.log("📡 Received signal:", metadata);
      const { peerId, roomId, offer, answer, candidate, videoToggle, audioToggle } = metadata;

      if (!peerId || !roomId) {
        console.error("❌ Invalid signal: missing peerId or roomId");
        return;
      }

      let pc: RTCPeerConnection | null | undefined = peers.current.get(peerId);
      if (!pc) {
        const stream = localStreamRef.current || await initStream();
        if (!stream) return;
        pc = createPeerConnection(roomId, peerId, stream);
        if (!pc) return;
      }

      try {
        if (offer) {
          console.log("📥 Processing offer:", offer);
          await pc.setRemoteDescription(new RTCSessionDescription(offer));
          const pendingCands = pendingCandidates.get(peerId) || [];
          for (const candidate of pendingCands) {
            await pc.addIceCandidate(new RTCIceCandidate(candidate));
          }
          pendingCandidates.delete(peerId);

          const answerDesc = await pc.createAnswer();
          await pc.setLocalDescription(answerDesc);
          console.log("📤 Sending answer:", answerDesc);
          socketIo?.emit("call:signal", {
            peerId: peerId,
            roomId,
            answer: answerDesc,
          });
        }

        if (answer) {
          console.log("📥 Processing answer:", answer);
          await pc.setRemoteDescription(new RTCSessionDescription(answer));
          const pendingCands = pendingCandidates.get(peerId) || [];
          for (const candidate of pendingCands) {
            await pc.addIceCandidate(new RTCIceCandidate(candidate));
          }
          pendingCandidates.delete(peerId);
        }

        if (candidate) {
          console.log("📥 Processing candidate:", candidate);
          if (pc.remoteDescription) {
            await pc.addIceCandidate(new RTCIceCandidate(candidate));
          } else {
            const queue = pendingCandidates.get(peerId) || [];
            queue.push(candidate);
            pendingCandidates.set(peerId, queue);
            console.log("📌 Queued candidate for later processing");
          }
        }

        if (videoToggle !== undefined) {
          console.log(`📹 Remote video toggle: ${videoToggle}`);
          setIsVideoEnabled(videoToggle);
        }

        if (audioToggle !== undefined) {
          console.log(`🔊 Remote audio toggle: ${audioToggle}`);
          setIsAudioEnabled(audioToggle);
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
    if (isVideoEnabled) {
      if (localVideoTrack) {
        localVideoTrack.enabled = false;
        console.log("✅ Video track disabled");
        socketIo?.emit("call:signal", {
          peerId: peers.current.keys().next().value, // Giả sử chỉ có một peer
          roomId: roomId,
          videoToggle: false,
        });
      }
    } else {
      try {
        const videoStream = await mediaDevices.getUserMedia({ video: true });
        const newVideoTrack = videoStream.getVideoTracks()[0];
        peers.current.forEach((pc, peerId) => {
          console.log("✅ Adding new video track to peer:", newVideoTrack);
          pc.addTrack(newVideoTrack, localStreamRef.current!);
          socketIo?.emit("call:signal", {
            peerId: peerId,
            roomId: roomId,
            videoToggle: true,
          });
        });
        setLocalVideoTrack(newVideoTrack as any);
        if (localStreamRef.current) {
          localStreamRef.current.addTrack(newVideoTrack);
          setLocalStream(localStreamRef.current);
        }
        console.log("✅ Video track enabled");
      } catch (error) {
        console.error("❌ Failed to get video stream:", error);
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
        socketIo?.emit("call:signal", {
          peerId: peers.current.keys().next().value, // Giả sử chỉ có một peer
          roomId: roomId,
          audioToggle: audioTrack.enabled,
        });
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
    handleStreamAndPeer,
    connectState,
    hangOut,
    toggleVideo,
    toggleAudio,
    isVideoEnabled,
    isAudioEnabled,
  };
};