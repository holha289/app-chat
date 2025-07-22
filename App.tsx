import React from 'react';
import AppNavigator from './src/navigation/AppNavigator';
import { StatusBar } from 'expo-status-bar';
import { Provider } from 'react-redux';
import { store } from './src/store';
import './global.css';
import { initializeFirebase } from '@app/core/firebase';

export default function App() {
  React.useEffect(() => {
    // Khởi tạo Firebase và thông báo
    const initApp = async () => {
      try {
        await initializeFirebase();
        console.log('Firebase đã được khởi tạo thành công');
      } catch (error) {
        console.error('Lỗi khởi tạo Firebase:', error);
      }
    };
    
    initApp();
  }, []);
  
  return (
    <Provider store={store}>
      <AppNavigator />
      <StatusBar style="auto" />
    </Provider>
  );
}
