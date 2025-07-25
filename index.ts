import 'react-native-gesture-handler';
import { registerRootComponent } from 'expo';
import App from './App';
// ⚠️ Phải là file không có React (nằm ngoài React tree)
import messaging from '@react-native-firebase/messaging';

messaging().setBackgroundMessageHandler(async remoteMessage => {
  console.log('💤 Xử lý background message:', remoteMessage);
  // Tùy app cần làm gì (ví dụ lưu vào DB)
});

registerRootComponent(App);
