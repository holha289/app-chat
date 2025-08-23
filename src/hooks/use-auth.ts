import { AuthState } from "@app/features/types/auth.type";


export const useResetStateAuth = (state: AuthState): AuthState => {
   return {
       ...state,
       isAuthenticated: false,
       user: null,
       status: "idle",
       message: null,
       error: null,
       tokens: {
           accessToken: null,
           refreshToken: null,
           fcmToken: null,
           expiresIn: 0,
       }
   }
};


export const useResetStateAuthTokens = (state: AuthState) => {
   return {
       ...state,
       tokens: {
           accessToken: null,
           refreshToken: null,
           fcmToken: null,
           expiresIn: 0,
       }
   }
};