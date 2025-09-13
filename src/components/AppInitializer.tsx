import { useEffect, useRef, useCallback } from "react";
import { useDispatch } from "react-redux";
import msgActions from "@app/features/message/msg.action";
import { initializeFirebase } from "@app/core/firebase";
import { requestMediaPermissions, requestPermission, requestStoragePermission } from "@app/core/permissions";
import { registerAllListeners } from "@app/store";
import { useSockerIo } from "@app/hooks/use-socketio";

const EVENT_MSG_RECEIVED = "room:message:received";

export function AppInitializer() {
  const dispatch = useDispatch();
  const { socket, connectSocket } = useSockerIo(); // gọi hook ở top-level
  const didInit = useRef(false);                   // chặn double-run StrictMode

  // const socketHandler = useCallback((payload: any) => {
  //   const m = payload?.metadata?.message;
  //   const roomId = payload?.metadata?.roomId;
  //   if (!m || !roomId) return;

  //   const msg = {
  //     msg_id: m?.id,
  //     createdAt: m?.createdAt,
  //     msg_content: m?.content,
  //   };
  //   dispatch(msgActions.reciverMsg({ roomId, message: m }));
  //   dispatch(msgActions.updateLastMsg({ roomId, message: msg }));
  // }, [dispatch]);

  // 1) Firebase + permission (chạy 1 lần)
  useEffect(() => {
    if (didInit.current) return;
    didInit.current = true;

    registerAllListeners();
    (async () => {
      try {
        await initializeFirebase(async () => {
          const permission = await requestPermission();
          await requestMediaPermissions()
          await requestStoragePermission()
          return !!permission;
        });
      } catch (err) {
        console.error("❌ Lỗi khởi tạo Firebase:", err);
      }
    })();
  }, []);

  // // 2) Socket: connect + bind listener (off trước khi on) + cleanup
  // useEffect(() => {
  //   // đảm bảo có kết nối
  //   if (!socket?.connected) {
  //     try {
  //       connectSocket();
  //     } catch (err) {
  //       console.error("❌ Lỗi khởi tạo Socket:", err);
  //     }
  //   }

  //   if (!socket) return;

  //   // luôn off trước để tránh trùng listener (idempotent)
  //   socket.off(EVENT_MSG_RECEIVED, socketHandler);
  //   socket.on(EVENT_MSG_RECEIVED, socketHandler);

  //   // khi socket reconnect, đảm bảo không nhân đôi listener
  //   const onConnect = () => {
  //     socket.off(EVENT_MSG_RECEIVED, socketHandler);
  //     socket.on(EVENT_MSG_RECEIVED, socketHandler);
  //   };
  //   socket.off("connect", onConnect);
  //   socket.on("connect", onConnect);

  //   // cleanup khi unmount / hot-reload
  //   return () => {
  //     socket.off(EVENT_MSG_RECEIVED, socketHandler);
  //     socket.off("connect", onConnect);
  //   };
  // }, [socket, connectSocket, socketHandler]);

  return null; // không render UI
}
