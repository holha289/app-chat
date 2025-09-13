import { StateCore } from "@app/features/types";

export interface AuthState extends StateCore {
  tokens: {
    accessToken: string | null;
    refreshToken: string | null;
    fcmToken: string | null;
    expiresIn: number;
  };
  user: {
    id: string ;
    fullname: string;
    email: string;
    phone: string;
    avatar: string;
    gender: string;
    slug: string;
    dateOfBirth: string;
  } | null;
  isAuthenticated: boolean;
}

export interface LoginPayload {
  phone: string;
  password: string;
  callback?: (error?: any) => void;
}

export interface RegisterPayload {
  fullname: string;
  username: string;
  password: string;
  gender?: string;
  avatar?: string;
  callback?: (error?: any) => void;
}

export type tokensType = AuthState["tokens"];
export type userType = AuthState["user"];
