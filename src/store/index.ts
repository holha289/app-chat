import { authReducer } from '@app/features'
import { AuthListenerMiddleware } from '@app/features/auth/auth.middleware';
import ContactListenerMiddleware from '@app/features/contact/contact.middleware';
import { ContactReducer } from '@app/features/contact/contact.reducer';
import { MsgListenerMiddleware } from '@app/features/message';
import msgReducer from '@app/features/message/msg.reducer';
import UserListenerMiddleware from '@app/features/user/user.middleware';
import userReducer from '@app/features/user/user.reducer';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { combineReducers, configureStore } from '@reduxjs/toolkit'
import { createListenerMiddleware, TypedStartListening } from "@reduxjs/toolkit";
import { persistReducer, persistStore } from 'redux-persist';
 import Reactotron from '../../ReactotronConfig.ts'
// import FileStore from 'metro-cache/src/stores/FileStore';
// tạo middleware để lắng nghe các action
const listenerMiddleware = createListenerMiddleware();


const rootReducer = combineReducers({
  auth: authReducer,
  msg: msgReducer,
  contact: ContactReducer,
  user: userReducer
});

const persistConfig = {
  key: 'root',
  storage: AsyncStorage, // lưu trữ vào AsyncStorage
  whitelist: ['auth', 'msg'],  // chỉ định slice muốn lưu
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

// Khởi tạo store với các reducer và middleware
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }).prepend(listenerMiddleware.middleware),
  enhancers: (getDefaultEnhancers) =>
    getDefaultEnhancers().concat(Reactotron.createEnhancer!()),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
export type AppStartListening = TypedStartListening<RootState, AppDispatch>;
export const startAppListening = listenerMiddleware.startListening as AppStartListening;
export default listenerMiddleware;

export const registerAllListeners = () => {
  AuthListenerMiddleware(); // Gọi ở đây, sau khi store đã tạo
  MsgListenerMiddleware();
  ContactListenerMiddleware();
  UserListenerMiddleware();
};

export const persistor = persistStore(store);
// persistor.purge(); // Xoá dữ liệu đã lưu trong AsyncStorage khi ứng dụng khởi động