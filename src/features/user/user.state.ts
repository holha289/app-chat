import { StateCore } from "../types";
import { Friends } from "../types/contact.type";

const UserState: StateCore & {
    friendRequestPending: [],
    call: {
        roomId: number | string;
        from: null | Friends;
        to: null | Friends;
        data?: null;
        isVideoCall: boolean;
        category: 'request' | 'incoming' | 'accept' | 'reject' | 'idle';
    };
} = {
    friendRequestPending: [],
    call: {
        roomId: "",
        from: null,
        to: null,
        data: null,
        isVideoCall: false,
        category: 'idle'
    },
    status: "idle",
    message: null,
    error: null
}

export default UserState;