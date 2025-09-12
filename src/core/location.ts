import { Platform } from 'react-native';
import * as Location from 'expo-location';

// ⚠️ Nếu cần: enable high accuracy trên Android
const GEO_OPTIONS = {
  enableHighAccuracy: true,
  timeout: 15000,
  maximumAge: 10000,
};

/**
 * Xin quyền và lấy vị trí hiện tại
 */
const getCurrentLocation = (): Promise<Location.LocationObject> => {
  return new Promise(async (resolve, reject) => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== 'granted') {
        console.log('❌ Không được cấp quyền vị trí');
        return reject(new Error('Permission denied'));
      }

      let location = await Location.getCurrentPositionAsync({});

      resolve(location);
    } catch (err) {
      console.log('⚠️ Lỗi không xác định:', err);
      reject(err);
    }
  });
};

export { getCurrentLocation };
