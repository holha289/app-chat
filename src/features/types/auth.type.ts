import { StateCore } from "@app/features/types"

export interface AuthState extends StateCore {
    tokens: {
        access: string | null;
        refresh: string | null;
    };
    user: {
        id: string;
        name: string;
        email: string;
        phone: string;
        avatar: string;
        gender: string;
        createdAt: string;
        updatedAt: string;
    } | null;
    isAuthenticated: boolean;
}

export interface LoginPayload {
    phone: string;
    password: string;
}