import React, { useEffect } from "react";
import AppNavigator from "./src/navigation/AppNavigator";
import { StatusBar } from "expo-status-bar";
import { Provider } from "react-redux";
import { persistor, store } from "./src/store";
import "./global.css";
import { initializeFirebase } from "@app/core/firebase";
import { registerAllListeners } from "@app/store";
import { PersistGate } from "redux-persist/lib/integration/react";
import { selectAuthAccessToken } from "@app/features";
import { getSocket, initSocket } from "@app/core/socketIo";
import { requestPermission } from "@app/core/permissions";
import { API_URL } from "@env";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { NavigationContainer } from "@react-navigation/native";
export default function App() {
  useEffect(() => {
 
    registerAllListeners();
    const token = selectAuthAccessToken(store.getState());
    if (token) {
      // Khởi tạo socket với token nếu đã đăng nhập
      initSocket(token);
    }
    const initApp = async () => {
      try {
        // await requestLocationPermission();
        await initializeFirebase(async () => {
          const permission = await requestPermission();
          if (permission) {
            // Nếu có quyền thông báo thì đi tiếp
            return true;
          }

          return false;
        });
      } catch (error) {
        console.error("❌ Lỗi khởi tạo Firebase:", error);
      }
    };

    initApp();


    // initSocket();
  }, []);

  return (
    // <Provider store={store}>
    //   <PersistGate loading={null} persistor={persistor}>
    //     <AppNavigator />
    //     <StatusBar style="auto" />
    //   </PersistGate>
    // </Provider>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <GestureHandlerRootView className="flex-1">
          <SafeAreaProvider>
            <AppNavigator />
            <StatusBar style="auto" />
          </SafeAreaProvider>
        </GestureHandlerRootView>
      </PersistGate>
    </Provider>
  );
}
