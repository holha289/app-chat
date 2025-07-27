import { AuthState } from "../types/auth.type";

const initialState: AuthState = {
    tokens: {
        accessToken: null,
        refreshToken: null,
        fcmToken: null
    },
    user: {
        id: 0,
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
