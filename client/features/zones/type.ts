export type ZoneStatus =
    | 'ACTIVE'
    | 'INACTIVE';


export interface Warehouse {
    id: number;
    name: string;
    code: string;
}

export interface ZoneRecord {
    id: number;
    name: string;
    code: string;
    description: string | null;
    status: ZoneStatus;
    warehouseId: string;
    warehouse: Warehouse;
    createdAt: string;
    updatedAt: string;
}

export interface ZoneMeta {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

export interface ZoneResponse {
    data: ZoneRecord[];
    meta: ZoneMeta;
}

export interface QueryZoneParams {
    page?: number;
    limit?: number;
    search?: string;
    status?: ZoneStatus;
}