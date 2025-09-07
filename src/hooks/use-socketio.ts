import { disconnectSocket, getSocket, initSocket } from "@app/core/socketIo";
import { RootState, store } from "@app/store";
import { useEffect, useState, useCallback, useRef } from "react";

export const useSockerIo = () => {
  const [socket, setSocket] = useState(getSocket());
  const isConnectingRef = useRef(false);

  const connectSocket = useCallback(() => { 
    console.log('🎯 useSockerIo: Attempting to connect socket...');
    
    if (isConnectingRef.current) {
      console.log('⏳ Already connecting, skipping...');
      return;
    }
    
    const token = getAccessToken();
    if (token) {
      isConnectingRef.current = true;
      console.log('🚀 Initializing socket with token...');
      
      try {
        const newSocket = initSocket(token);
        console.log('✅ Socket initialized:', !!newSocket);
        
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
    }, 20000); // Check every 20 seconds instead of 1

    return () => clearInterval(interval);
  }, [socket]);

  return {
    socket,
    connectSocket,
    disconnect,
  };
}


function getAccessToken(): string | null {
    const state: RootState = store.getState();
    return state.auth.tokens?.accessToken || null;
}
