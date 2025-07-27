import { AuthState } from "../types/auth.type";

const initialState: AuthState = {
    tokens: {
        accessToken: null,
        refreshToken: null,
        fcmToken: null
    },
    user: null,
    isAuthenticated: false,
    status: "idle",
    message: null,
    error: null
};

export default initialState;
