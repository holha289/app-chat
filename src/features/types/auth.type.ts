import { StateCore } from "@app/features/types"

export interface AuthState extends StateCore {
    token: string
    user: {
        id: string;
        name: string;
        email: string;
        phone: string;
        avatar?: string;
        createdAt: string;
        updatedAt: string;
    } | null;
    isAuthenticated: boolean;
}

export interface LoginPayload {
    phone: string;
    password: string;
}