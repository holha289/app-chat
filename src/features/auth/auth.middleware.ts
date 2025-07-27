import { getFCMToken } from "@app/core/firebase";
import { AuthState, LoginPayload } from "../types/auth.type";
import authActions from "./auth.action";
import apiService from "@app/services/api.service";
import { startAppListening } from "@app/store";
import { ApiResponse } from "@app/types/response";

/**
 *  call api mới dùng ListenerMiddleware
*/
export const AuthListenerMiddleware = () => {
  LoginListener();
  registerAuthListener();
  logoutAuthListener();
  setFcmTokenListener();
};


const LoginListener = () => {
  startAppListening({
    actionCreator: authActions.login,
    effect: async (action, listenerApi) => {
      try {
        const payload = action.payload as LoginPayload;
        const fcmToken = await getFCMToken();
        const response = await apiService.post<ApiResponse<AuthState>>("/auth/login", {
          username: payload.phone,
          password: payload.password
        });
        listenerApi.dispatch(authActions.loginSuccess({ 
          tokens: {
            ...response.metadata.tokens,
            fcmToken: fcmToken || null
          } as AuthState['tokens'],
          user: response.metadata.user as AuthState['user']
        }));
        
        if (fcmToken) {
          console.log("fcmToken", fcmToken);
          listenerApi.dispatch(authActions.setFcmToken(fcmToken));
        }
      } catch (error) {
        console.error("Login failed:", error);
        const errorMessage = typeof error === "object" && error !== null && "message" in error ? (error as { message: string }).message : String(error);
        listenerApi.dispatch(authActions.loginFailed(errorMessage));
      }
    },
  });
}

export const registerAuthListener = () => {
  startAppListening({
    actionCreator: authActions.register,
    effect: async (action, listenerApi) => {
      try {
        const payload = action.payload;
        const response = await apiService.post<ApiResponse<AuthState>>("/auth/register", payload);
        listenerApi.dispatch(authActions.registerSuccess({ 
          tokens: response.metadata.tokens as AuthState['tokens'],
          user: response.metadata.user as AuthState['user']
        }));
      } catch (error) {
        console.error("Registration failed:", error);
        const errorMessage = typeof error === "object" && error !== null && "message" in error ? (error as { message: string }).message : String(error);
        listenerApi.dispatch(authActions.registerFailed(errorMessage));
      }
    },
  });
};

export const setFcmTokenListener = () => {
  startAppListening({
    actionCreator: authActions.setFcmToken,
    effect: async (action, listenerApi) => {
      const fcmToken = action.payload;
      try {
        await apiService.patch<ApiResponse<void>>("/auth/set-fcm-token", { token: fcmToken });
        console.log("FCM token set successfully:", fcmToken);
      } catch (error) {
        console.error("Failed to set FCM token:", error);
      }
    },
  });
};

export const logoutAuthListener = () => {
  startAppListening({
    actionCreator: authActions.logout,
    effect: (action, listenerApi) => {
      listenerApi.dispatch(authActions.logout());
    },
  });
};



