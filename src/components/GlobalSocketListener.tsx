import { useEffect, useRef, useCallback, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSockerIo } from "@app/hooks/use-socketio";
import msgActions from "@app/features/message/msg.action";
import { selectUser } from "@app/features";
import IncomingCallModal from "./Modals/CallModal";
import { selectCall } from "@app/features/user/user.selecter";
import UserActions from "@app/features/user/user.action";
import { Friends } from "@app/features/types/contact.type";

const GlobalSocketListener = () => {
  const { socket, connectSocket } = useSockerIo();
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const listenersRegistered = useRef(false);
  const reconnectTimeout = useRef<NodeJS.Timeout | null>(null);
  const call = useSelector(selectCall);
  const [formModal, setFormModal] = useState({
    isOpen: false,
    caller: null as Friends | null,
    isTo: false,
    isVideoCall: false,
    isAccepted: false,
    roomId: null as string | null
  });

  // Memoize callbacks để tránh tạo lại function
  const onNewMessage = useCallback((payload: any) => {
    console.log("� Global: New message received:", payload);
    const m = payload?.metadata?.message;
    const roomId = payload?.metadata?.roomId;

    if (!m || !roomId) {
      console.warn("⚠️ Invalid message payload:", payload);
      return;
    }

    const msg = {
      msg_id: m?.id,
      createdAt: m?.createdAt,
      msg_content: m?.content,
    };

    console.log("✅ Dispatching message actions for room:", roomId);
    dispatch(msgActions.reciverMsg({ roomId, message: m }));
    dispatch(msgActions.updateLastMsg({ roomId, message: msg }));
  }, [dispatch]);

  const onConnect = useCallback(() => {
    console.log("✅ Socket connected successfully!");
    console.log("  - Socket ID:", socket?.id);
    console.log("  - Connection time:", new Date().toISOString());
    console.log("  - Transport:", socket?.io?.engine?.transport?.name);

    // Reset listeners flag để đăng ký lại
    listenersRegistered.current = false;

    // Clear reconnect timeout nếu có
    if (reconnectTimeout.current) {
      clearTimeout(reconnectTimeout.current);
      reconnectTimeout.current = null;
      console.log("  - Cleared reconnect timeout");
    }
  }, [socket]);

  const onDisconnect = useCallback((reason: string) => {
    console.log("❌ Socket disconnected!");
    console.log("  - Reason:", reason);
    console.log("  - Time:", new Date().toISOString());
    console.log("  - Will auto-reconnect:", user && reason !== 'io client disconnect');

    listenersRegistered.current = false; // Reset flag

    // Auto-reconnect sau 3 giây nếu không phải do client disconnect
    if (user && reason !== 'io client disconnect' && !reconnectTimeout.current) {
      console.log("⏰ Setting up auto-reconnect in 3 seconds...");
      reconnectTimeout.current = setTimeout(() => {
        console.log("🔄 Auto-reconnecting socket after disconnect...");
        connectSocket();
        reconnectTimeout.current = null;
      }, 3000);
    }
  }, [user, connectSocket]);

  const onConnectError = useCallback((error: any) => {
    console.error("🚫 Socket connection error!");
    console.error("  - Error message:", error?.message || error);
    console.error("  - Error type:", error?.type || typeof error);
    console.error("  - Time:", new Date().toISOString());

    listenersRegistered.current = false;

    // Retry connection sau 5 giây
    if (user && !reconnectTimeout.current) {
      console.log("⏰ Will retry connection in 5 seconds...");
      reconnectTimeout.current = setTimeout(() => {
        console.log("🔄 Retrying connection after error...");
        connectSocket();
        reconnectTimeout.current = null;
      }, 5000);
    }
  }, [user, connectSocket]);

  const onReconnect = useCallback(() => {
    console.log("🔄 Socket reconnected successfully");
    if (user) {
      // Refresh data when reconnected
      dispatch(msgActions.getRoom());
    }
  }, [user, dispatch]);

  // Debug listener để log tất cả events
  const debugListener = useCallback((eventName: string, data: any) => {
    const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
    console.log(`🎯 [${timestamp}] Socket event: ${eventName}`, data);
  }, []);

  // Effect để quản lý connection
  useEffect(() => {
    console.log("🔗 Connection management effect running...");

    // Nếu có user nhưng chưa có socket hoặc socket chưa connect
    if (user && (!socket || !socket.connected)) {
      console.log("🔄 Need to connect socket...");
      console.log("  - User ID:", user?.id || 'unknown');
      console.log("  - Socket exists:", !!socket);
      console.log("  - Socket connected:", socket?.connected);

      // Delay một chút để tránh spam connection
      const timeoutId = setTimeout(() => {
        console.log("🚀 Triggering socket connection...");
        connectSocket();
      }, 1000);

      return () => clearTimeout(timeoutId);
    }
  }, [user, socket?.connected, connectSocket]);

  // Effect để quản lý event listeners
  useEffect(() => {
    console.log("🔍 GlobalSocketListener effect running...");
    console.log("📊 Current state:");
    console.log("  - Socket exists:", !!socket);
    console.log("  - Socket connected:", socket?.connected);
    console.log("  - Socket ID:", socket?.id || 'none');
    console.log("  - User exists:", !!user);
    console.log("  - User ID:", user?.id || 'none');
    console.log("  - Listeners registered:", listenersRegistered.current);

    // Nếu không có socket, skip
    if (!socket) {
      console.warn("⚠️ No socket available, skipping event listeners");
      return;
    }

    // Nếu chưa có user, không đăng ký listeners
    if (!user) {
      console.warn("⚠️ No user available, skipping event listeners");
      return;
    }

    // Chỉ đăng ký listeners một lần cho mỗi socket instance
    if (listenersRegistered.current) {
      console.log("ℹ️ Listeners already registered for this socket, skipping...");
      return;
    }

    console.log("📡 Registering socket event listeners...");

    // Cleanup existing listeners trước khi đăng ký mới
    socket.off("connect");
    socket.off("disconnect");
    socket.off("connect_error");
    socket.off("reconnect");
    socket.off("room:message:received");
    socket.off("call:incoming");
    socket.off("call:rejected");
    socket.off("call:accepted");
    socket.off("call:signal");
    socket.off("client:signal");
    socket.offAny(debugListener);

    // Đăng ký các listeners
    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("connect_error", onConnectError);
    socket.on("reconnect", onReconnect);
    socket.on("room:message:received", onNewMessage);

    socket.on("call:incoming", (data) => {
      console.log("📞 Incoming call:", data);
      const metadata = data?.metadata || {};
      const userTo = metadata.to && metadata.to.id === user?.id;
      if (userTo) {
        dispatch(UserActions.call(metadata));
      }
    });

    socket.on("call:rejected", (data) => {
      const metadata = data?.metadata || {};
      const userTo = metadata.to && metadata.to.id === user?.id;
      if (userTo) {
        dispatch(UserActions.call(metadata));
      }
    });

    socket.on("call:accepted", (data) => {
      const metadata = data?.metadata || {};
      const userTo = metadata.to && metadata.to.id === user?.id;
      if (userTo) {
        dispatch(UserActions.call(metadata));
      }
    });

    // Debug listener
    socket.onAny(debugListener);

    // Mark listeners as registered
    listenersRegistered.current = true;
    console.log("✅ Socket event listeners registered successfully");

    // Cleanup function
    return () => {
      console.log("🧹 Cleaning up socket event listeners...");
      if (socket) {
        socket.off("connect", onConnect);
        socket.off("disconnect", onDisconnect);
        socket.off("connect_error", onConnectError);
        socket.off("reconnect", onReconnect);
        socket.off("room:message:received", onNewMessage);
        socket.off("call:incoming");
        socket.off("call:rejected");
        socket.off("call:accepted");
        socket.off("call:signal");
        socket.off("client:signal");
        socket.offAny(debugListener);
        console.log("  - Cleaned up listeners for socket:", socket.id);
      }

      // Clear timeout if exists
      if (reconnectTimeout.current) {
        clearTimeout(reconnectTimeout.current);
        reconnectTimeout.current = null;
      }

      listenersRegistered.current = false;
    };
  }, [socket, user, onConnect, onDisconnect, onConnectError, onReconnect, onNewMessage, debugListener]);


  useEffect(() => {
    if (call) {
      const isOpen = call.from?.id === user?.id || call.to?.id === user?.id;
      const caller = call.from?.id === user?.id ? call.from : call.to;
      setFormModal({
        isOpen,
        caller: caller,
        isVideoCall: call.isVideoCall,
        isAccepted: call.category === 'accept',
        isTo: call.to?.id === user?.id,
        roomId: call.roomId as string | null
      });
    }
  }, [call]);

  const onAcceptCall = () => {
    const userTo = call.to?.id !== user?.id ? call.to : call.from;
    dispatch(UserActions.call({
      roomId: call.roomId as string,
      from: user as unknown as Friends,
      to: userTo as Friends,
      isVideoCall: false,
      category: 'accept'
    }));
  };

  const onDeclineCall = () => {
    const userTo = call.to?.id !== user?.id ? call.to : call.from;
    dispatch(UserActions.call({
      roomId: call.roomId as string,
      from: user as unknown as Friends,
      to: userTo as Friends,
      isVideoCall: false,
      category: 'reject'
    }));
  };

  return (
    <>
      <IncomingCallModal
        visible={formModal.isOpen}
        onAccept={() => onAcceptCall()}
        onDecline={() => onDeclineCall()}
        caller={formModal.caller}
        isVideoCall={formModal.isVideoCall}
        isTo={formModal.isTo}
        isAccepted={formModal.isAccepted}
        roomId={formModal.roomId}
      />
    </>
  );
};



// 

export default GlobalSocketListener;
