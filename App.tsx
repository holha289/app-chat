import React from "react";
import AppNavigator from "./src/navigation/AppNavigator";
import { StatusBar } from "expo-status-bar";
import { Provider } from "react-redux";
import { persistor, store } from "./src/store";
import "./global.css";
import { PersistGate } from "redux-persist/lib/integration/react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AppInitializer } from "@app/components/AppInitializer";
import GlobalSocketListener from "@app/components/GlobalSocketListener";
import SocketInitializer from "@app/components/SocketInitializer";
import { ActionSheetProvider } from "@expo/react-native-action-sheet";

export default function App() {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <GestureHandlerRootView className="flex-1">
          <SafeAreaProvider>
            <AppInitializer />
            <SocketInitializer />
            <GlobalSocketListener />
            <ActionSheetProvider>
              <AppNavigator />
            </ActionSheetProvider>
            <StatusBar style="auto" />
          </SafeAreaProvider>
        </GestureHandlerRootView>
      </PersistGate>
    </Provider>
  );
}
