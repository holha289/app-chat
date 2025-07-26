import { AuthState } from "../types/auth.type";

const initialState: AuthState = {
    tokens: {
        access: null,
        refresh: null
    },
    user: null,
    isAuthenticated: false,
    status: "pending",
    error: null
};

export default initialState;
