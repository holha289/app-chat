import { deleteFCMToken, getFCMToken } from "@app/core/firebase";
import { AuthState, LoginPayload } from "../types/auth.type";
import authActions from "./auth.action";
import apiService from "@app/services/api.service";
import { persistor, startAppListening } from "@app/store";
import { ApiResponse } from "@app/types/response";
import { useErrorResponse } from "@app/hooks/use-error";

/**
 *  call api mới dùng ListenerMiddleware
 */
export const AuthListenerMiddleware = () => {
  LoginListener();
  registerAuthListener();
  logoutAuthListener();
  setFcmTokenListener();
  updateProfileListener();
};

const LoginListener = () => {
  startAppListening({
    actionCreator: authActions.login,
    effect: async (action, listenerApi) => {
      try {
        const payload = action.payload;
        console.log("🚀 ~ LoginListener ~ payload:", payload);
        const fcmToken = await getFCMToken();
        const response = await apiService.post<ApiResponse<AuthState>>(
          "/auth/login",
          {
            username: payload.phone,
            password: payload.password,
          }
        );
        listenerApi.dispatch(
          authActions.loginSuccess({
            tokens: {
              ...response.metadata.tokens,
              fcmToken: fcmToken || null,
            } as AuthState["tokens"],
            user: response.metadata.user as AuthState["user"],
            isAuthenticated: true,
          })
        );
        if (fcmToken) {
          listenerApi.dispatch(authActions.setFcmToken(fcmToken));
        }
      } catch (error) {
        console.error("Login failed:", error);
        listenerApi.dispatch(authActions.loginFailed(useErrorResponse(error)));
      }
    },
  });
};

export const registerAuthListener = () => {
  startAppListening({
    actionCreator: authActions.register,
    effect: async (action, listenerApi) => {
      try {
        const payload = action.payload;
        const fcmToken = await getFCMToken();
        const response = await apiService.post<ApiResponse<AuthState>>(
          "/auth/register",
          payload
        );
        listenerApi.dispatch(
          authActions.registerSuccess({
            tokens: response.metadata.tokens as AuthState["tokens"],
            user: response.metadata.user as AuthState["user"],
            isAuthenticated: true,
          })
        );
        if (fcmToken) {
          listenerApi.dispatch(authActions.setFcmToken(fcmToken));
        }
      } catch (error) {
        console.error("Registration failed:", error);
        listenerApi.dispatch(
          authActions.registerFailed(useErrorResponse(error))
        );
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
        await apiService.patch<ApiResponse<void>>("/auth/set-fcm-token", {
          token: fcmToken,
        });
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
    effect: async (action, listenerApi) => {
      await deleteFCMToken();
      persistor.purge();
      // listenerApi.dispatch(authActions.logout());
    },
  });
};

export const updateProfileListener = () => {
  startAppListening({
    actionCreator: authActions.updateProfile,
    effect: async (action, listenerApi) => {
      try {
        const payload = action.payload;
        const response = await apiService.patch<ApiResponse<AuthState["user"]>>(
          "/profile/update",
          payload
        );
        listenerApi.dispatch(
          authActions.updateProfileSuccess({
            user: response.metadata as AuthState["user"],
          })
        );
        payload.callback();
      } catch (error) {
        console.error("Update profile failed:", error);
        listenerApi.dispatch(
          authActions.updateProfileFailed(useErrorResponse(error))
        );
      }
    },
  });
};
