export type WarehouseStatus =
    | 'ACTIVE'
    | 'INACTIVE';



export interface WarehouseRecord {
    id: number;
    name: string;
    code: string;
    description: string | null;
    status: WarehouseStatus;
    createdAt: string;
    updatedAt: string;
}

export interface WarehouseMeta {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

export interface WarehouseResponse {
    data: WarehouseRecord[];
    meta: WarehouseMeta;
}

export interface QueryWarehouseParams {
    page?: number;
    limit?: number;
    search?: string;
    status?: WarehouseStatus;
}



/** create color */

export interface CreateWarehouseRequest {
    name: string;
    code: string;
    description?: string;
}

export interface CreateWarehouseResponse {
    message: string;
}