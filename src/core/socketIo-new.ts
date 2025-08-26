import { API_URL } from "@app/config";
import { io, Socket } from "socket.io-client";

// Socket instance và flags để quản lý connection
let socket: Socket | null = null;
let isConnecting = false;

export const initSocket = (token: string): Socket => {
  console.log('🔌 Initializing socket with token:', token ? '***' : 'NO_TOKEN');
  console.log('🌐 API_URL:', API_URL);
  console.log('🔄 Current status:', { 
    exists: !!socket, 
    connected: socket?.connected,
    connecting: isConnecting 
  });

  if (!token) {
    console.error('❌ Cannot initialize socket: No access token provided');
    return socket as Socket;
  }

  // Nếu đang connecting, chờ
  if (isConnecting) {
    console.log('⏳ Already connecting, please wait...');
    return socket as Socket;
  }

  // Nếu socket đã tồn tại và connected
  if (socket && socket.connected) {
    console.log('✅ Socket already connected, reusing connection');
    return socket;
  }

  // Nếu socket tồn tại nhưng not connected
  if (socket && !socket.connected) {
    console.log('🔄 Socket exists but disconnected, reconnecting...');
    socket.connect();
    return socket;
  }

  // Tạo socket mới
  console.log('🆕 Creating new socket instance...');
  isConnecting = true;

  socket = io(API_URL, {
    transports: ["websocket", "polling"], // Fallback to polling
    extraHeaders: {
      Authorization: `Bearer ${token}`,
    },
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    timeout: 15000,
    forceNew: false,
  });

  // Connection events
  socket.on("connect", () => {
    console.log("✅ Socket connected successfully:", socket?.id);
    console.log("🔗 Transport:", socket?.io.engine.transport.name);
    isConnecting = false;
  });

  socket.on("disconnect", (reason) => {
    console.log("❌ Socket disconnected:", reason);
    isConnecting = false;
  });

  socket.on("connect_error", (err) => {
    console.error("🚫 Socket connection error:", err.message);
    isConnecting = false;
  });

  socket.on("reconnect", (attemptNumber) => {
    console.log("🔄 Socket reconnected after", attemptNumber, "attempts");
    isConnecting = false;
  });

  socket.on("reconnect_attempt", (attemptNumber) => {
    console.log("🔄 Reconnection attempt", attemptNumber);
  });

  socket.on("reconnect_error", (err) => {
    console.error("🚫 Reconnection error:", err.message);
  });

  socket.on("reconnect_failed", () => {
    console.error("💀 Reconnection failed completely");
    isConnecting = false;
  });

  console.log("📡 Socket instance created and connecting...");
  return socket;
};

export const getSocket = (): Socket | null => {
  return socket;
};

export const isSocketConnected = (): boolean => {
  return socket?.connected || false;
};

export const disconnectSocket = (): void => {
  console.log('🔌 Disconnecting socket...');
  if (socket) {
    isConnecting = false;
    socket.disconnect();
    socket = null;
    console.log('✅ Socket disconnected and cleared');
  } else {
    console.log('⚠️ No socket to disconnect');
  }
};
