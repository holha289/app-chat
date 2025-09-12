import { useEffect } from 'react';
import { useSockerIo } from '@app/hooks/use-socketio';

const SocketInitializer = () => {
  const { socket, connectSocket } = useSockerIo();

  useEffect(() => {
    try {
      if (!socket) {
        connectSocket();
      }
    } catch (error) {
      console.error("❌ Lỗi khởi tạo Socket:", error);
    }
  }, [socket, connectSocket]);

  return null; // Component này không render gì cả
};

export default SocketInitializer;
