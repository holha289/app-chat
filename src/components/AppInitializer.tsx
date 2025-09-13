import { useEffect, useRef } from "react";
import { initializeFirebase } from "@app/core/firebase";
import { requestMediaPermissions, requestPermission, requestStoragePermission } from "@app/core/permissions";
import { registerAllListeners } from "@app/store";

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
          await requestMediaPermissions()
          await requestStoragePermission()
          return !!permission;
        });
      } catch (err) {
        console.error("❌ Lỗi khởi tạo Firebase:", err);
      }
    })();
  }, []);
  return null; // không render UI
}
