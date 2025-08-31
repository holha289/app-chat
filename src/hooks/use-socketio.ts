import { disconnectSocket, getSocket, initSocket } from "@app/core/socketIo";
import { RootState, store } from "@app/store";
import { useEffect, useState, useCallback, useRef } from "react";

export const useSockerIo = () => {
  const [socket, setSocket] = useState(getSocket());
  const isConnectingRef = useRef(false);

  const connectSocket = useCallback(() => { 
    if (isConnectingRef.current) {
      console.log('⏳ Already connecting, skipping...');
      return;
    }
    
    const token = getAccessToken();
    if (token) {
      isConnectingRef.current = true;
      try {
        const newSocket = initSocket(token);        
        // Update socket state immediately if we got a socket
        if (newSocket) {
          setSocket(newSocket);
        }
      } catch (error) {
        console.error('❌ Failed to initialize socket:', error);
      } finally {
        // Reset connecting flag after a delay
        setTimeout(() => {
          isConnectingRef.current = false;
        }, 3000);
      }
    } else {
      console.warn('⚠️ useSockerIo: No access token available');
    }
  }, []);

  const reTryConnection = useCallback(() => {
    console.log('🔄 useSockerIo: Retrying socket connection...');
    connectSocket();
  }, [connectSocket]);

  const disconnect = useCallback(() => {
    console.log('🔌 useSockerIo: Disconnecting socket...');
    disconnectSocket();
    setSocket(null);
    isConnectingRef.current = false;
  }, []);

  // Periodically check for socket updates
  useEffect(() => {
    const interval = setInterval(() => {
      const currentSocket = getSocket();
      if (currentSocket !== socket) {
        console.log('🔄 Socket state changed in hook:', {
          had: !!socket,
          now: !!currentSocket,
          connected: currentSocket?.connected
        });
        setSocket(currentSocket);
      }
    }, 2000); // Check every 2 seconds instead of 1

    return () => clearInterval(interval);
  }, [socket]);

  return {
    socket,
    connectSocket,
    disconnect,
    reTryConnection
  };
}


function getAccessToken(): string | null {
    const state: RootState = store.getState();
    return state.auth.tokens?.accessToken || null;
}
