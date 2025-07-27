import messaging, { FirebaseMessagingTypes } from "@react-native-firebase/messaging";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform, Alert, ToastAndroid } from "react-native";
import firebase from "@react-native-firebase/app";
import auth from "@react-native-firebase/auth";
import notifee, { AndroidImportance } from '@notifee/react-native';
import { getAuth as getFirebaseAuth } from "@react-native-firebase/auth";

/**
 * Thiết lập dịch vụ messaging Firebase
 */
export async function setupMessaging() {
  try {
    // Lấy FCM token
    const token = await getFCMToken();
    if (!token) {
      console.warn("Không lấy được FCM Token, không thể thiết lập messaging");
      return false;
    }
    console.log("Đã thiết lập messaging thành công với token:", token);
    // Xử lý thông báo khi app đang chạy foreground
    messaging().onMessage(async (remoteMessage) => await onMessageReceived(remoteMessage, 'foreground'));
    // Xử lý thông báo khi app được mở từ background state
    messaging().onNotificationOpenedApp(async (remoteMessage) => await onMessageReceived(remoteMessage, 'background'));
    messaging().setBackgroundMessageHandler(async (remoteMessage) => await onMessageReceived(remoteMessage, 'background'));

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
export async function initializeFirebase(callback: () => Promise<boolean> = async () => true) {
  try {
    // Kiểm tra kết nối với Firebase
    await firebase.app().options;
    const permission: boolean = await callback(); // Gọi callback để yêu cầu quyền thông báo
    if (!permission) {
      console.log("Không có quyền thông báo, không thể khởi tạo Firebase");
      return false;
    }
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
    try {
      await AsyncStorage.setItem("fcmToken", token);
    } catch (error) {
      console.error("Lỗi refresh token fcm:", error);
    }
  });
}

/**
 * Lấy FCM token của thiết bị để đăng ký với server
 * @returns {Promise<string|null>} FCM token hoặc null nếu không lấy được
 */
export async function getFCMToken() {
  try {
    // Lấy token từ bộ nhớ nếu có
    const storedToken = await AsyncStorage.getItem("fcmToken");
    if (storedToken) {
      return storedToken;
    }
    // Lấy token mới từ Firebase
    const fcmToken = await messaging().getToken();
    if (fcmToken) {
      await AsyncStorage.setItem("fcmToken", fcmToken);
      return fcmToken;
    }
    return null;
  } catch (error) {
    console.error("Lỗi khi lấy FCM token:", error);
    return null;
  }
}

const onMessageReceived = async (remoteMessage: FirebaseMessagingTypes.RemoteMessage, state: 'foreground' | 'background') => {
  console.log(`Thông báo nhận được trong trạng thái ${state}:`, remoteMessage);
  await notifee.displayNotification({
    title: remoteMessage.notification?.title ?? 'Thông báo mới',
    body: remoteMessage.notification?.body ?? 'Bạn có tin nhắn mới',
    android: {
      channelId: 'default',
      importance: AndroidImportance.HIGH,
      smallIcon: 'ic_launcher', // tên icon từ res/drawable
    },
  });
};

const deleteFCMToken = async () => { // Xoá FCM token khỏi Firebase khi người dùng đăng xuất
  try { 
    // Xoá token khỏi bộ nhớ
    await AsyncStorage.removeItem("fcmToken");
     await messaging().deleteToken();
  } catch (error) {
    if (Platform.OS === 'android') {
      ToastAndroid.show("Lỗi khi xoá FCM token", ToastAndroid.SHORT);
    } else {
      Alert.alert("Lỗi", "Không thể xoá FCM token");
    }
  }
};

const getAuth = () => {
   return getFirebaseAuth();
};

// Export các dịch vụ và hàm tiện ích
export { firebase, auth, deleteFCMToken, getAuth };
