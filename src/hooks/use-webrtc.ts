import { useSockerIo } from "./use-socketio";



export const useWebRTC = () => {
    const { socket } = useSockerIo();

    if (!socket) {
        console.error("Socket not initialized");
        return;
    }

    const startCall = (userId: string) => {
        socket.emit("room:send:call", { userId });
    };

    const endCall = () => { // thoát cuộc gọi hoặc reject
        socket.emit("room:send:end-call");
    };

    const acceptCall = () => {
        socket.emit("room:send:accept-call");
    };

    const eventReceiver = (
        call: (data: {to: string, from: string}) => void,
        end: (data: {to: string}) => void,
        accept: (data: {to: string, from: string}) => void
    ) => {
        socket.on("room:receive:call", (data) => {
            call(data);
        });
        
        socket.on("room:receive:end-call", (data) => {
            end(data);
        });

        socket.on("room:receive:accept-call", (data) => {
            accept(data);
        });
    };

    return {
        startCall,
        endCall,
        acceptCall,
        eventReceiver
    };
};
