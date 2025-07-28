import notifee, { AuthorizationStatus } from '@notifee/react-native';
import { PermissionsAndroid, Platform } from 'react-native';
import Geolocation from 'react-native-geolocation-service';
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



const requestLocationPermission = async () => {
  if (Platform.OS === 'ios') {
    Geolocation.requestAuthorization('whenInUse');
  } else {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Cấp quyền vị trí',
          message: 'Ứng dụng cần quyền truy cập vị trí để hoạt động.',
          buttonNeutral: 'Hỏi sau',
          buttonNegative: 'Từ chối',
          buttonPositive: 'Đồng ý',
        },
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        console.log('Đã được cấp quyền vị trí');
      } else {
        console.log('Bị từ chối quyền vị trí');
      }
    } catch (err) {
      console.warn(err);
    }
  }
};

export { requestPermission,requestLocationPermission };
