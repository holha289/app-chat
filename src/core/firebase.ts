import messaging from '@react-native-firebase/messaging';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import firebase from '@react-native-firebase/app';
import auth from '@react-native-firebase/auth';

/**
 * Khởi tạo tất cả các dịch vụ Firebase cần thiết
 * Gọi hàm này trong thành phần cao nhất của ứng dụng (App.tsx)
 */
export async function initializeFirebase() {
  try {
    // Kiểm tra kết nối với Firebase
    await firebase.app().options;
    console.log('Đã kết nối thành công với Firebase');
    
    // Khởi tạo dịch vụ thông báo
    await getFCMToken();
    
    return true;
  } catch (error) {
    console.error('Lỗi khi khởi tạo Firebase:', error);
    return false;
  }
}

/**
 * Yêu cầu quyền gửi thông báo từ người dùng
 * @returns {Promise<boolean>} Trả về true nếu được cấp quyền, false nếu không
 */
export async function requestUserPermission() {
  // Kiểm tra nếu đang chạy trên thiết bị di động
  if (Platform.OS === 'web') {
    console.log('Thông báo FCM không được hỗ trợ trên web');
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
      console.log('Trạng thái quyền thông báo:', authStatus);
      return true;
    }
    
    console.log('Quyền thông báo bị từ chối');
    return false;
  } catch (error) {
    console.error('Lỗi khi yêu cầu quyền thông báo:', error);
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
      console.log('Không có quyền thông báo, không thể lấy token');
      return null;
    }
    
    // Lấy token từ bộ nhớ nếu có
    const storedToken = await AsyncStorage.getItem('fcmToken');
    if (storedToken) {
      console.log('Sử dụng token đã lưu:', storedToken);
      return storedToken;
    }
    
    // Lấy token mới từ Firebase
    const fcmToken = await messaging().getToken();
    if (fcmToken) {
      console.log('FCM Token mới:', fcmToken);
      
      // Lưu token vào bộ nhớ để sử dụng sau
      await AsyncStorage.setItem('fcmToken', fcmToken);
      return fcmToken;
    }
    
    console.log('Không lấy được FCM Token');
    return null;
  } catch (error) {
    console.error('Lỗi khi lấy FCM token:', error);
    return null;
  }
}

// Export các dịch vụ và hàm tiện ích
export { firebase, auth };