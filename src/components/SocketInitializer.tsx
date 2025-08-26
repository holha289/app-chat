import { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { useSockerIo } from '@app/hooks/use-socketio';
import { selectUser, selectAuthAccessToken } from '@app/features';

const SocketInitializer = () => {
  const { socket, connectSocket } = useSockerIo();
  const user = useSelector(selectUser);
  const accessToken = useSelector(selectAuthAccessToken);
  const initAttempted = useRef(false);
  const lastToken = useRef<string | null>(null);

  useEffect(() => {
    console.log('🚀 SocketInitializer: Effect running');
    console.log('User:', !!user);
    console.log('Access Token:', !!accessToken);
    console.log('Socket exists:', !!socket);
    console.log('Socket connected:', socket?.connected);
    console.log('Init attempted:', initAttempted.current);
    console.log('Token changed:', lastToken.current !== accessToken);

    // Reset nếu token thay đổi (user login/logout)
    if (lastToken.current !== accessToken) {
      console.log('🔄 Token changed, resetting initialization flag');
      initAttempted.current = false;
      lastToken.current = accessToken;
    }

    // Chỉ init socket khi:
    // 1. User đã đăng nhập
    // 2. Có access token
    // 3. Chưa từng init hoặc socket chưa connect
    // 4. Socket chưa tồn tại hoặc chưa kết nối
    if (user && accessToken && !initAttempted.current) {
      console.log('✅ Conditions met, initializing socket connection...');
      initAttempted.current = true;
      
      try {
        connectSocket();
        console.log('📡 Socket connection initiated');
      } catch (error) {
        console.error('❌ Failed to initialize socket:', error);
        // Reset flag để có thể thử lại
        initAttempted.current = false;
      }
    } else {
      console.log('⏳ Skipping socket initialization:');
      console.log('  - User logged in:', !!user);
      console.log('  - Has access token:', !!accessToken);
      console.log('  - Not attempted yet:', !initAttempted.current);
    }

    // Reset flag khi user logout
    if (!user || !accessToken) {
      initAttempted.current = false;
    }
  }, [user, accessToken, socket?.connected, connectSocket]);

  return null;
};

export default SocketInitializer;
