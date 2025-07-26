import React, { useEffect } from "react";
import AppNavigator from "./src/navigation/AppNavigator";
import { StatusBar } from "expo-status-bar";
import { Provider } from "react-redux";
import { store } from "./src/store";
import "./global.css";
import { initializeFirebase } from "@app/core/firebase";
import messaging from "@react-native-firebase/messaging";
import { requestPermission } from "@app/core/permissions";

export default function App() {
  useEffect(() => {
    const initApp = async () => {
       try {
          await initializeFirebase(async () => {
             const permission = await requestPermission(); 
             if (permission) { // Nếu có quyền thông báo thì đi tiếp
                return true;
             } 
             return false;
          });
       } catch (error) {
          console.error("❌ Lỗi khởi tạo Firebase:", error);
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
