import { useEffect, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { useSockerIo } from '@app/hooks/use-socketio';
import msgActions from '@app/features/message/msg.action';
import { MessageItem } from '@app/features/types/msg.type';

interface SocketPayload {
  metadata: {
    message: MessageItem;
    roomId: string;
  };
}

export const useChatSocket = (roomId: string) => {
  const dispatch = useDispatch();
  const { socket } = useSockerIo();

  const messageHandler = useCallback((payload: SocketPayload) => {
    const message = payload?.metadata?.message;
    const receivedRoomId = payload?.metadata?.roomId;

    if (message && receivedRoomId === roomId) {
      dispatch(msgActions.reciverMsg({ roomId, message }));
    }
  }, [dispatch, roomId]);

  useEffect(() => {
    if (!socket) return;

    socket.on("room:message:received", messageHandler);
    // Có thể bạn chỉ cần lắng nghe 1 sự kiện `room:message:received`
    // thay vì cả `sended` và `received` ở client.
    
    return () => {
      socket.off("room:message:received", messageHandler);
    };
  }, [socket, messageHandler]);
};