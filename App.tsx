import React, { useEffect } from "react";
import AppNavigator from "./src/navigation/AppNavigator";
import { StatusBar } from "expo-status-bar";
import { Provider } from "react-redux";
import { store } from "./src/store";
import "./global.css";

import { initializeFirebase } from "@app/core/firebase";
import { requestAllPermissions } from "@app/core/permissions";

import * as Notifications from "expo-notifications";
import messaging, {
  firebase,
  getMessaging,
  onMessage,
} from "@react-native-firebase/messaging";

// ⚠️ Config trước khi app khởi chạy (quan trọng)
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export default function App() {
  useEffect(() => {
    const initApp = async () => {
      try {
        await initializeFirebase(); // ✅ Khởi tạo Firebase
        await requestAllPermissions(); // ✅ Gọi quyền

        console.log("✅ Firebase đã được khởi tạo thành công");

        // Đăng ký token (optional)
        const token = await messaging().getToken();
        console.log("📲 FCM Token:", token);
      } catch (error) {
        console.error("❌ Lỗi khởi tạo Firebase:", error);
      }
    };

    initApp();

    // ✅ Foreground message: dùng `onMessage()` từ modular API
    const unsubscribe = onMessage(getMessaging(firebase.app()), async (remoteMessage) => {
      console.log("🔥 Tin nhắn foreground:", remoteMessage);

      const notification = remoteMessage.notification;

      // Hiện thông báo popup
      if (notification) {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: notification.title || "📩 Tin nhắn mới",
            body: notification.body || "",
            sound: "default",
          },
          trigger: null, // Hiện ngay
        });
      }
    });

    return () => unsubscribe(); // Cleanup
  }, []);

  return (
    <Provider store={store}>
      <AppNavigator />
      <StatusBar style="auto" />
    </Provider>
  );
}
