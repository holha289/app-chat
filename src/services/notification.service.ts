import messaging from '@react-native-firebase/messaging';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getFCMToken } from '../core/firebase';

/**
 * Service để xử lý việc gửi và nhận thông báo
 */
export class NotificationService {
  
  /**
   * Gửi một thông báo test để kiểm tra
   */
  static async sendTestNotification() {
    try {
      const token = await getFCMToken();
      if (!token) {
        console.log('Không có FCM token để gửi thông báo');
        return false;
      }

      console.log('Sẽ gửi thông báo test đến token:', token);
      
      // Trong môi trường thực tế, bạn sẽ gửi token này đến server
      // và server sẽ sử dụng Firebase Admin SDK để gửi thông báo
      
      // Ví dụ payload để gửi từ server:
      const examplePayload = {
        token: token,
        notification: {
          title: 'Thông báo test',
          body: 'Đây là thông báo test từ Firebase'
        },
        data: {
          type: 'test',
          timestamp: Date.now().toString()
        }
      };
      
      console.log('Payload mẫu để gửi từ server:', examplePayload);
      return true;
    } catch (error) {
      console.error('Lỗi khi chuẩn bị gửi thông báo test:', error);
      return false;
    }
  }

  /**
   * Lấy token và lưu vào AsyncStorage
   */
  static async getAndSaveToken() {
    try {
      const token = await getFCMToken();
      console.log('FCM Token hiện tại:', token);
      return token;
    } catch (error) {
      console.error('Lỗi khi lấy token:', error);
      return null;
    }
  }

  /**
   * Thiết lập listener cho token refresh
   */
  static setupTokenRefreshListener() {
    messaging().onTokenRefresh(async (token) => {
      console.log('FCM Token đã được làm mới:', token);
      // Lưu token mới vào AsyncStorage
      try {
        await AsyncStorage.setItem('fcmToken', token);
        console.log('Token mới đã được lưu');
      } catch (error) {
        console.error('Lỗi khi lưu token mới:', error);
      }
    });
  }
}
