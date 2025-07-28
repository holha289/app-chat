// import notifee, { AuthorizationStatus as NotifAuth } from '@notifee/react-native';
// import { Platform } from 'react-native';
// import {
//   check,
//   request,
//   PERMISSIONS,
//   RESULTS,
//   Permission,
// } from 'react-native-permissions';

// type PermissionStatus = 'granted' | 'denied' | 'unavailable';

// const log = console.log;

// export const requestNotificationPermission = async (): Promise<boolean> => {
//   try {
//     const settings = await notifee.requestPermission();

//     if (settings.authorizationStatus === NotifAuth.AUTHORIZED) {
//       log('🔔 Quyền thông báo: OK');
//       return true;
//     }

//     if (settings.authorizationStatus === NotifAuth.DENIED) {
//       log('❌ Người dùng từ chối quyền thông báo');
//       return false;
//     }

//     log('❓ Không rõ trạng thái thông báo');
//     return false;
//   } catch (error) {
//     log('❌ Lỗi khi yêu cầu quyền thông báo:', error);
//     return false;
//   }
// };

// export const requestSystemPermission = async (
//   permission: Permission,
//   label: string
// ): Promise<PermissionStatus> => {
//   try {
//     const result = await check(permission);

//     if (result === RESULTS.GRANTED) {
//       log(`✅ Quyền ${label}: Đã được cấp`);
//       return 'granted';
//     }

//     if (result === RESULTS.DENIED) {
//       const reqResult = await request(permission);
//       if (reqResult === RESULTS.GRANTED) {
//         log(`✅ Quyền ${label}: Đã được cấp sau khi yêu cầu`);
//         return 'granted';
//       } else {
//         log(`❌ Quyền ${label}: Bị từ chối`);
//         return 'denied';
//       }
//     }

//     if (result === RESULTS.BLOCKED) {
//       log(`🔒 Quyền ${label}: Bị chặn vĩnh viễn`);
//       return 'denied';
//     }

//     log(`⚠️ Quyền ${label}: Không khả dụng`);
//     return 'unavailable';
//   } catch (error) {
//     log(`❌ Lỗi khi yêu cầu quyền ${label}:`, error);
//     return 'unavailable';
//   }
// };

// export const checkPermissionStatus = async (permission: Permission): Promise<PermissionStatus> => {
//   try {
//     const result = await check(permission);
    
//     switch (result) {
//       case RESULTS.GRANTED:
//         return 'granted';
//       case RESULTS.DENIED:
//       case RESULTS.BLOCKED:
//         return 'denied';
//       default:
//         return 'unavailable';
//     }
//   } catch (error) {
//     log(`❌ Lỗi khi kiểm tra quyền:`, error);
//     return 'unavailable';
//   }
// };

// export const requestAllPermissions = async () => {
//   try {
//     const promises: Promise<PermissionStatus>[] = [];

//     // Notifications
//     const notif = await requestNotificationPermission();

//     if (Platform.OS === 'android') {
//       // Camera
//       promises.push(requestSystemPermission(PERMISSIONS.ANDROID.CAMERA, 'Camera'));

//       // Storage / Media (Android 13+ dùng READ_MEDIA_IMAGES)
//       promises.push(
//         requestSystemPermission(
//           Platform.Version >= 33
//             ? PERMISSIONS.ANDROID.READ_MEDIA_IMAGES
//             : PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE,
//           'Thư viện ảnh'
//         )
//       );

//       // Location
//       promises.push(
//         requestSystemPermission(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION, 'Vị trí')
//       );
//     } else if (Platform.OS === 'ios') {
//       // iOS
//       promises.push(requestSystemPermission(PERMISSIONS.IOS.CAMERA, 'Camera'));
//       promises.push(requestSystemPermission(PERMISSIONS.IOS.PHOTO_LIBRARY, 'Thư viện ảnh'));
//       promises.push(
//         requestSystemPermission(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE, 'Vị trí')
//       );
//     }

//     const results = await Promise.all(promises);
//     const allGranted = notif && results.every((r) => r === 'granted');

//     if (allGranted) {
//       log('🎉 Tất cả quyền đã được cấp!');
//     } else {
//       log('⚠️ Một số quyền bị từ chối.');
//     }

//     return {
//       allGranted,
//       notification: notif,
//       permissions: results,
//     };
//   } catch (error) {
//     log('❌ Lỗi khi yêu cầu quyền:', error);
//     return {
//       allGranted: false,
//       notification: false,
//       permissions: [],
//     };
//   }
// };
import notifee, { AuthorizationStatus } from '@notifee/react-native';

const requestPermission = async () => {
  let status = false
  const settings = await notifee.requestPermission();
  if (settings.authorizationStatus === AuthorizationStatus.NOT_DETERMINED) {
    // 💬 Hiện popup xin quyền nếu lần đầu
    const newSettings = await notifee.requestPermission();
    if (newSettings.authorizationStatus === AuthorizationStatus.AUTHORIZED) {
      status = true;
    } else if (newSettings.authorizationStatus === AuthorizationStatus.DENIED) {
      console.log('❌ Người dùng từ chối quyền. Yêu cầu bật trong Cài đặt');
      status = false;
    } else {
      console.log('❌ Không rõ trạng thái quyền thông báo');
      status = false;
    }
  } else if (settings.authorizationStatus === AuthorizationStatus.DENIED) {
    console.log('❌ Người dùng từ chối quyền. Yêu cầu bật trong Cài đặt');
    status = false;
  } else {
    console.log('✅ Đã có quyền thông báo');
    status = true;
  }
  return status;
}

export { requestPermission };