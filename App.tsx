import React, { useEffect } from "react";
import AppNavigator from "./src/navigation/AppNavigator";
import { StatusBar } from "expo-status-bar";
import { Provider } from "react-redux";
import { persistor, store } from "./src/store";
import "./global.css";
import { initializeFirebase } from "@app/core/firebase";
import { requestPermission } from "@app/core/permissions";
import { registerAllListeners } from "@app/store";
import { PersistGate } from "redux-persist/lib/integration/react";

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
    registerAllListeners();
  }, []);

  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <AppNavigator />
        <StatusBar style="auto" />
      </PersistGate>
    </Provider>
  );
}
