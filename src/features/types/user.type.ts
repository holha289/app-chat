import { Friends } from "./contact.type";


export interface PayloadCall {
    roomId: number | string;
    from: Friends;
    to: Friends;
    isVideoCall: boolean;
    category: 'request' | 'incoming' | 'accept' | 'reject';
}