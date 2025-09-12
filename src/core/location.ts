import { Platform } from 'react-native';
import Geolocation, { GeolocationResponse } from '@react-native-community/geolocation';
import {
  check,
  request,
  PERMISSIONS,
  RESULTS,
  openSettings,
} from 'react-native-permissions';

// ⚠️ Nếu cần: enable high accuracy trên Android
const GEO_OPTIONS = {
  enableHighAccuracy: true,
  timeout: 15000,
  maximumAge: 10000,
};

/**
 * Xin quyền và lấy vị trí hiện tại
 */
const getCurrentLocation = (): Promise<GeolocationResponse> => {
  return new Promise(async (resolve, reject) => {
    try {
      const locationPermission =
        Platform.OS === 'ios'
          ? PERMISSIONS.IOS.LOCATION_WHEN_IN_USE
          : PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION;

      let status = await check(locationPermission);

      if (status === RESULTS.DENIED || status === RESULTS.LIMITED) {
        status = await request(locationPermission);
      }

      if (status === RESULTS.GRANTED) {
        Geolocation.getCurrentPosition(
          (position) => {
            resolve(position);
          },
          (error) => {
            console.log('❌ Lỗi lấy vị trí:', error);
            reject(error);
          },
          GEO_OPTIONS
        );
      } else if (status === RESULTS.BLOCKED) {
        console.log('⚠️ Quyền vị trí bị chặn. Mở cài đặt.');
        openSettings();
        reject(new Error('Permission blocked'));
      } else {
        console.log('❌ Không được cấp quyền vị trí');
        reject(new Error('Permission denied'));
      }
    } catch (err) {
      console.log('⚠️ Lỗi không xác định:', err);
      reject(err);
    }
  });
};

export { getCurrentLocation };
