import { AuthState } from "../types/auth.type";

const initialState: AuthState = {
    tokens: {
        accessToken: null,
        refreshToken: null,
        fcmToken: null,
        expiresIn: 0,
    },
    user: {
        id: "",
        slug: '',
        fullname: '',
        email: '',
        phone: '',
        avatar: '',
        gender: '',
        dateOfBirth: '',
    },
    isAuthenticated: false,
    status: "idle",
    message: null,
    error: null
};

export default initialState;
