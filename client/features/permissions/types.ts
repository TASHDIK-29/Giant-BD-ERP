export interface Permission {
    id: number;
    name: string;
    key: string;
    description: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface PermissionGroup {
    id: number;
    name: string;
    key: string;
    description: string | null;
    permissions: Permission[];
    permissionCount: number;
    createdAt: string;
    updatedAt: string;
}

export interface PermissionGroupsMeta {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

export interface PermissionGroupsResponse {
    data: PermissionGroup[];
    meta: PermissionGroupsMeta;
}

export interface QueryPermissionGroupsParams {
    page?: number;
    limit?: number;
    search?: string;
}