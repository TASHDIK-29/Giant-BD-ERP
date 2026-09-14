export type RoleStatus =
    | 'ACTIVE'
    | 'INACTIVE';

export interface RoleRecord {
    id: number;
    name: string;
    description: string | null;
    status: RoleStatus;
    isSystem: boolean;

    userCount: number;
    permissionCount: number;

    createdAt: string;
    updatedAt: string;
}

export interface RolesMeta {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

export interface RolesResponse {
    data: RoleRecord[];
    meta: RolesMeta;
}

export interface QueryRolesParams {
    page?: number;
    limit?: number;
    search?: string;
    status?: RoleStatus;
}