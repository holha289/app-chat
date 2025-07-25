import messaging from "@react-native-firebase/messaging";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform, Alert, ToastAndroid } from "react-native";
import firebase from "@react-native-firebase/app";
import auth from "@react-native-firebase/auth";
import * as Notifications from "expo-notifications";

/**
 * Thiết lập dịch vụ messaging Firebase
 */
export async function setupMessaging() {
  try {
    // Yêu cầu quyền thông báo
    const hasPermission = await requestUserPermission();
    if (!hasPermission) {
      console.log("Không có quyền thông báo");
      return false;
    }

    // Lấy FCM token
    const token = await getFCMToken();
    if (token) {
      console.log("Đã thiết lập messaging thành công với token:", token);
    }

    // Xử lý thông báo khi app đang chạy foreground
    messaging().onMessage(async (remoteMessage) => {
      console.log("Thông báo nhận được trong foreground:", remoteMessage);
      await Notifications.scheduleNotificationAsync({
        content: {
          title: remoteMessage.notification?.title || "Tin mới!",
          body: remoteMessage.notification?.body || "",
          sound: "default",
        },
        trigger: null,
      });
    });

    // Xử lý thông báo khi app được mở từ background state
    messaging().onNotificationOpenedApp((remoteMessage) => {
      console.log(
        "App được mở từ background state bởi thông báo:",
        remoteMessage
      );
    });
    messaging().setBackgroundMessageHandler(async (remoteMessage) => {
      console.log(
        "📦 Thông báo nhận được trong background/quit:",
        remoteMessage
      );
    });
    // Kiểm tra xem app có được mở từ quit state bởi một thông báo không
    messaging()
      .getInitialNotification()
      .then((remoteMessage) => {
        if (remoteMessage) {
          console.log(
            "App được mở từ quit state bởi thông báo:",
            remoteMessage
          );
        }
      });

    return true;
  } catch (error) {
    console.error("Lỗi khi thiết lập messaging:", error);
    return false;
  }
}

/**
 * Khởi tạo tất cả các dịch vụ Firebase cần thiết
 * Gọi hàm này trong thành phần cao nhất của ứng dụng (App.tsx)
 */
export async function initializeFirebase() {
  try {
    // Kiểm tra kết nối với Firebase
    await firebase.app().options;
    console.log("Đã kết nối thành công với Firebase");

    // Khởi tạo dịch vụ thông báo
    await setupMessaging();

    // Thiết lập listener cho token refresh
    setupTokenRefreshListener();

    return true;
  } catch (error) {
    console.error("Lỗi khi khởi tạo Firebase:", error);
    return false;
  }
}

/**
 * Thiết lập listener cho token refresh
 */
function setupTokenRefreshListener() {
  messaging().onTokenRefresh(async (token) => {
    console.log("FCM Token đã được làm mới:", token);
    try {
      await AsyncStorage.setItem("fcmToken", token);
      console.log("Token mới đã được lưu");
    } catch (error) {
      console.error("Lỗi khi lưu token mới:", error);
    }
  });
}

/**
 * Yêu cầu quyền gửi thông báo từ người dùng
 * @returns {Promise<boolean>} Trả về true nếu được cấp quyền, false nếu không
 */
export async function requestUserPermission() {
  // Kiểm tra nếu đang chạy trên thiết bị di động
  if (Platform.OS === "web") {
    console.log("Thông báo FCM không được hỗ trợ trên web");
    return false;
  }

  try {
    // Yêu cầu quyền gửi thông báo
    const authStatus = await messaging().requestPermission();

    // Kiểm tra xem người dùng đã cấp quyền chưa
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (enabled) {
      console.log("Trạng thái quyền thông báo:", authStatus);
      return true;
    }

    console.log("Quyền thông báo bị từ chối");
    return false;
  } catch (error) {
    console.error("Lỗi khi yêu cầu quyền thông báo:", error);
    return false;
  }
}

/**
 * Lấy FCM token của thiết bị để đăng ký với server
 * @returns {Promise<string|null>} FCM token hoặc null nếu không lấy được
 */
export async function getFCMToken() {
  try {
    // Kiểm tra xem đã có quyền thông báo chưa
    const hasPermission = await requestUserPermission();
    if (!hasPermission) {
      console.log("Không có quyền thông báo, không thể lấy token");
      return null;
    }

    // Lấy token từ bộ nhớ nếu có
    const storedToken = await AsyncStorage.getItem("fcmToken");
    if (storedToken) {
      console.log("Sử dụng token đã lưu:", storedToken);
      return storedToken;
    }

    // Lấy token mới từ Firebase
    const fcmToken = await messaging().getToken();
    if (fcmToken) {
      console.log("FCM Token mới:", fcmToken);

      // Lưu token vào bộ nhớ để sử dụng sau
      await AsyncStorage.setItem("fcmToken", fcmToken);
      return fcmToken;
    }

    console.log("Không lấy được FCM Token");
    return null;
  } catch (error) {
    console.error("Lỗi khi lấy FCM token:", error);
    return null;
  }
}

// Export các dịch vụ và hàm tiện ích
export { firebase, auth };
