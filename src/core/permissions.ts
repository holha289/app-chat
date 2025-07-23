import { Platform, PermissionsAndroid, Alert } from 'react-native';
import * as Notifications from 'expo-notifications';
import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions';

/**
 * Yêu cầu quyền gửi thông báo (Expo & native Android/iOS).
 */
export async function requestNotificationPermission(): Promise<boolean> {
  try {
    const { status: currentStatus } = await Notifications.getPermissionsAsync();

    if (currentStatus !== 'granted') {
      const { status: newStatus } = await Notifications.requestPermissionsAsync();
      if (newStatus !== 'granted') {
        Alert.alert('Thông báo', 'Bạn chưa cấp quyền nhận thông báo 😢');
        return false;
      }
    }

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'Thông báo',
        importance: Notifications.AndroidImportance.HIGH,
        sound: 'default',
      });
    }

    console.log('✅ Quyền thông báo đã được cấp');
    return true;
  } catch (error) {
    console.warn('❌ Lỗi khi yêu cầu quyền thông báo:', error);
    return false;
  }
}

/**
 * Yêu cầu quyền sử dụng micro
 */
export async function requestMicrophonePermission(): Promise<boolean> {
  try {
    if (Platform.OS === 'android') {
      const result = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
      );
      return result === PermissionsAndroid.RESULTS.GRANTED;
    } else {
      const result = await request(PERMISSIONS.IOS.MICROPHONE);
      return result === RESULTS.GRANTED;
    }
  } catch (error) {
    console.warn('❌ Lỗi xin quyền micro:', error);
    return false;
  }
}

/**
 * Yêu cầu quyền sử dụng camera
 */
export async function requestCameraPermission(): Promise<boolean> {
  try {
    if (Platform.OS === 'android') {
      const result = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.CAMERA,
      );
      return result === PermissionsAndroid.RESULTS.GRANTED;
    } else {
      const result = await request(PERMISSIONS.IOS.CAMERA);
      return result === RESULTS.GRANTED;
    }
  } catch (error) {
    console.warn('❌ Lỗi xin quyền camera:', error);
    return false;
  }
}

/**
 * Yêu cầu quyền truy cập bộ nhớ (ảnh/video)
 */
export async function requestStoragePermission(): Promise<boolean> {
  try {
    if (Platform.OS === 'android') {
      const result = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
      );
      return result === PermissionsAndroid.RESULTS.GRANTED;
    } else {
      const result = await request(PERMISSIONS.IOS.PHOTO_LIBRARY);
      return result === RESULTS.GRANTED;
    }
  } catch (error) {
    console.warn('❌ Lỗi xin quyền lưu trữ:', error);
    return false;
  }
}

/**
 * Yêu cầu quyền định vị (GPS)
 */
export async function requestLocationPermission(): Promise<boolean> {
  try {
    if (Platform.OS === 'android') {
      const result = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      );
      return result === PermissionsAndroid.RESULTS.GRANTED;
    } else {
      const result = await request(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE);
      return result === RESULTS.GRANTED;
    }
  } catch (error) {
    console.warn('❌ Lỗi xin quyền định vị:', error);
    return false;
  }
}

/**
 * ✅ Hàm tổng xin toàn bộ các quyền cần thiết
 */
export async function requestAllPermissions(): Promise<void> {
  const [
    notificationGranted,
    cameraGranted,
    micGranted,
    storageGranted,
    locationGranted,
  ] = await Promise.all([
    requestNotificationPermission(),
    requestCameraPermission(),
    requestMicrophonePermission(),
    requestStoragePermission(),
    requestLocationPermission(),
  ]);

  const grantedAll = notificationGranted && cameraGranted && micGranted && storageGranted && locationGranted;

  console.log('🔐 Tình trạng cấp quyền:', {
    notificationGranted,
    cameraGranted,
    micGranted,
    storageGranted,
    locationGranted,
  });

  if (!grantedAll) {
    Alert.alert('Thiếu quyền', 'Một số quyền không được cấp. Một số tính năng có thể không hoạt động.');
  }
}
