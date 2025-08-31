import { useEffect, useRef, useCallback } from "react";
import { useDispatch } from "react-redux";
import msgActions from "@app/features/message/msg.action";
import { initializeFirebase } from "@app/core/firebase";
import { requestPermission } from "@app/core/permissions";
import { registerAllListeners } from "@app/store";
import { useSockerIo } from "@app/hooks/use-socketio";
import IncomingCallModal from "./Modals/CallModal";

const EVENT_MSG_RECEIVED = "room:message:received";

export function AppInitializer() {
  const didInit = useRef(false);   

  // 1) Firebase + permission (chạy 1 lần)
  useEffect(() => {
    if (didInit.current) return;
    didInit.current = true;

    registerAllListeners();
    (async () => {
      try {
        await initializeFirebase(async () => {
          const permission = await requestPermission();
          return !!permission;
        });
      } catch (err) {
        console.error("❌ Lỗi khởi tạo Firebase:", err);
      }
    })();
  }, []);
  return null; // không render UI
}
