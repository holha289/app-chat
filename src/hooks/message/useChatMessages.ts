import { useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { selectMessage, selectMsgStatus } from '@app/features/message/msg.selectors';
import msgActions from '@app/features/message/msg.action';

export const useChatMessages = (roomId: string) => {
  const dispatch = useDispatch();
  
  const conversations = useSelector(selectMessage);
  const status = useSelector(selectMsgStatus);

  const messages = conversations[roomId]?.items ?? [];
  const cursor = conversations[roomId]?.nextCursor ?? null;
  const isLoading = status === 'pending';

  const loadMoreMessages = useCallback(() => {
    if (!isLoading && cursor) {
      dispatch(msgActions.getMsgByRoom({ roomId, cursor }));
    }
  }, [dispatch, roomId, cursor, isLoading]);

  useEffect(() => {
    // Chỉ fetch lần đầu khi messages rỗng
    if (messages.length === 0) {
        dispatch(msgActions.getMsgByRoom({ roomId, cursor: null }));
    }
  }, [dispatch, roomId, messages.length]);

  return { messages, isLoading, loadMoreMessages };
};