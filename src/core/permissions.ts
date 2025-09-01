import notifee, { AuthorizationStatus } from '@notifee/react-native';
import {
  check,
  request,
  PERMISSIONS,
  RESULTS,
  openSettings,
} from 'react-native-permissions';
import { PermissionsAndroid, Platform } from 'react-native';

const requestPermission = async () => {
  let notificationGranted = false;
  let locationGranted = false;

  // 🔔 1. Quyền thông báo
  try {
    const settings = await notifee.requestPermission();

    if (settings.authorizationStatus === AuthorizationStatus.AUTHORIZED) {
      console.log('✅ Đã cấp quyền thông báo');
      notificationGranted = true;
    } else {
      console.log('❌ Chưa được cấp quyền thông báo');
    }
  } catch (e) {
    console.log('⚠️ Lỗi xin quyền thông báo:', e);
  }

  // 📍 2. Quyền vị trí
  // try {
  //   const locationPermission =
  //     Platform.OS === 'ios'
  //       ? PERMISSIONS.IOS.LOCATION_WHEN_IN_USE
  //       : PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION;

  //   const locationStatus = await check(locationPermission);

  //   if (locationStatus === RESULTS.GRANTED) {
  //     console.log('✅ Đã có quyền vị trí');
  //     locationGranted = true;
  //   } else {
  //     const result = await request(locationPermission);

  //     if (result === RESULTS.GRANTED) {
  //       console.log('✅ Quyền vị trí được cấp sau khi yêu cầu');
  //       locationGranted = true;
  //     } else if (result === RESULTS.BLOCKED) {
  //       console.log('❌ Quyền vị trí bị chặn hoàn toàn, cần mở Cài đặt');
  //       openSettings(); // Mở settings nếu cần
  //     } else {
  //       console.log('❌ Người dùng từ chối quyền vị trí');
  //     }
  //   }
  // } catch (e) {
  //   console.log('⚠️ Lỗi xin quyền vị trí:', e);
  // }

  return {
    notification: notificationGranted,
    location: locationGranted,
  };
};

const requestMediaPermissions = async () => {
  if (Platform.OS === "android") {
    try {
      const granted = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.CAMERA,
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
      ]);

      const cameraGranted =
        granted[PermissionsAndroid.PERMISSIONS.CAMERA] ===
        PermissionsAndroid.RESULTS.GRANTED;
      const audioGranted =
        granted[PermissionsAndroid.PERMISSIONS.RECORD_AUDIO] ===
        PermissionsAndroid.RESULTS.GRANTED;

      return cameraGranted && audioGranted;
    } catch (err) {
      console.warn("Permission error:", err);
      return false;
    }
  } else {
    // iOS: tự động xin khi gọi getUserMedia
    return true;
  }
}

export { requestPermission, requestMediaPermissions };
