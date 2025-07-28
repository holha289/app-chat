import Geolocation from 'react-native-geolocation-service';
import {
  PermissionsAndroid,
  Platform,
} from 'react-native';

export const getCurrentLocation = async (): Promise<{
  latitude: number;
  longitude: number;
} | null> => {
  const hasPermission = await hasLocationPermission();
  if (!hasPermission) return null;

  return new Promise((resolve, reject) => {
    Geolocation.getCurrentPosition(
      position => {
        const { latitude, longitude } = position.coords;
        resolve({ latitude, longitude });
      },
      error => {
        console.error('Lỗi lấy vị trí:', error);
        reject(null);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 10000,
      }
    );
  });
};

const hasLocationPermission = async (): Promise<boolean> => {
  if (Platform.OS === 'ios') {
    return true;
  }

  const granted = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
    {
      title: 'Cấp quyền vị trí',
      message: 'App cần quyền truy cập vị trí để hoạt động.',
      buttonNeutral: 'Hỏi lại sau',
      buttonNegative: 'Từ chối',
      buttonPositive: 'Đồng ý',
    },
  );

  return granted === PermissionsAndroid.RESULTS.GRANTED;
};
