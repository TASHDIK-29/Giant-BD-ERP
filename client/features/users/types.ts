export type UserStatus =
    | 'ACTIVE'
    | 'INACTIVE';

export type UserGender =
    | 'MALE'
    | 'FEMALE'
    | 'OTHER';

export interface UserRole {
    id: number;
    name: string;
    description: string | null;
    status: UserStatus;
}

export interface UserRecord {
    id: number;
    name: string;
    email: string;
    phone: string | null;
    gender: UserGender | null;
    avatar: string | null;
    signature: string | null;
    status: UserStatus;
    roleId: number;

    role: UserRole;

    createdAt: string;
    updatedAt: string;
}

export interface UsersMeta {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export interface UsersResponse {
    data: UserRecord[];
    meta: UsersMeta;
}

export interface QueryUsersParams {
    page?: number;
    limit?: number;
    search?: string;
    roleId?: number;
    status?: UserStatus;
}