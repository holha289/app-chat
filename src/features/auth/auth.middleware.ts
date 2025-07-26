import { ActionCreatorWithPayload } from "@reduxjs/toolkit";
import { LoginPayload } from "../types/auth.type";
import authActions from "./auth.action";
import apiService from "@app/services/api.service";
import { startAppListening } from "@app/store";

/**
 *  call api mới dùng ListenerMiddleware
*/
export const AuthListenerMiddleware = () => {
  LoginListener();
  registerAuthListener();
  logoutAuthListener();
};


const LoginListener = () => {
  startAppListening({
    actionCreator: authActions.login,
    effect: async (action, listenerApi) => {
      try {
        const payload = action.payload as LoginPayload;
        const response = await apiService.post("/auth/login", payload);
        const user = await response;
        listenerApi.dispatch(authActions.loginSuccess({ user }));
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
        const response = await apiService.post("/auth/register", payload);
        const user = await response;
        listenerApi.dispatch(authActions.registerSuccess({ user }));
      } catch (error) {
        console.error("Registration failed:", error);
        const errorMessage = typeof error === "object" && error !== null && "message" in error ? (error as { message: string }).message : String(error);
        listenerApi.dispatch(authActions.registerFailed(errorMessage));
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



