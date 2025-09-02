import 'react-native-webrtc';
import type { RTCIceCandidate } from 'react-native-webrtc';

declare module 'react-native-webrtc' {
  interface RTCPeerConnection {
    onicecandidate: ((event: { candidate: RTCIceCandidate | null }) => void) | null;
    ontrack: ((event: { streams: MediaStream[] }) => void) | null;
    oniceconnectionstatechange: (() => void) | null;
    onconnectionstatechange: (() => void) | null;
    onicegatheringstatechange: (() => void) | null;
  }
}
