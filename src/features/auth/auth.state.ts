import { AuthState } from "../types/auth.type";

const initialState: AuthState = {
    token: "",
    user: null,
    isAuthenticated: false,
    status: "pending",
    error: null
};

export default initialState;
