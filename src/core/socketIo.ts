import { API_URL } from "@env";
import { io, Socket } from "socket.io-client";

// Đổi thành domain backend của bạn

let socket: Socket | null = null;

export const initSocket = (token: string): Socket => {
  if (!socket) {
    console.log(API_URL, "API_URL");
    socket = io(API_URL, {
      transports: ["websocket"],
      extraHeaders: {
        Authorization: `Bearer ${token}`,
      },
      autoConnect: true, // tự động connect nếu chưa kết nối
      reconnection: true, // Bật chế độ reconnect
      reconnectionAttempts: 5, // Số lần thử reconnect
      reconnectionDelay: 2000, // Delay giữa các lần thử (ms)
    });

    socket.on("connect", () => {
      console.log("✅ Socket connected:", socket?.id);
    });

    socket.on("disconnect", (reason) => {
      console.log("❌ Socket disconnected:", reason);
    });

    socket.on("connect_error", (err) => {
      console.log("🚫 Socket connect error:", err.message);
    });
  }

  return socket;
};

export const getSocket = (): Socket | null => socket;

export const disconnectSocket = () => {
  socket?.disconnect();
  socket = null;
};
