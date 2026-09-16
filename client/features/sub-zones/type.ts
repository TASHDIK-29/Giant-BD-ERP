import { Warehouse } from "../zones/type";

export type SubZoneStatus =
    | 'ACTIVE'
    | 'INACTIVE';



export interface Zone {
    id: number;
    name: string;
    code: string;
    warehouse : Warehouse
}

export interface SubZoneRecord {
    id: number;
    name: string;
    code: string;
    description: string | null;
    status: SubZoneStatus;
    zoneId: string;
    zone: Zone;
    createdAt: string;
    updatedAt: string;
}

export interface SubZoneMeta {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

export interface SubZoneResponse {
    data: SubZoneRecord[];
    meta: SubZoneMeta;
}

export interface QuerySubZoneParams {
    page?: number;
    limit?: number;
    search?: string;
    status?: SubZoneStatus;
}




/** create sub zone */

export interface CreateSubZoneRequest {
    name: string;
    code: string;
    zoneId: string;
    description?: string;
}

export interface CreateSubZoneResponse {
    message: string;
}