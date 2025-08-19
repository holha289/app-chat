import { StateCore } from "@app/features/types"

export interface ContactState extends StateCore {
  friends: Friends[];
  groups: Groups[];
  blocked: Blocked[];
  pending: Pending[];
}


export interface Friends {
    email: string | null;
    slug: string;
    fullname: string;
    phone: string;
    avatar: string;
    gender: string;
    id: number;
    dateOfBirth: string;
}

export interface Groups {
    id: number;
    name: string;
    members: string[];
}

export interface Blocked {
    id: number;
    name: string;
    avatar: string;
}

export interface Pending {
    id: number;
    name: string;
    avatar: string;
}
