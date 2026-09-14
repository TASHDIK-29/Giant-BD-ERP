export type ColorsStatus =
    | 'ACTIVE'
    | 'INACTIVE';



export interface ColorsRecord {
    id: number;
    name: string;
    description: string | null;
    status: ColorsStatus;
    createdAt: string;
    updatedAt: string;
}

export interface ColorsMeta {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

export interface ColorsResponse {
    data: ColorsRecord[];
    meta: ColorsMeta;
}

export interface QueryColorsParams {
    page?: number;
    limit?: number;
    search?: string;
    status?: ColorsStatus;
}