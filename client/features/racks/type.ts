import { Zone } from "../sub-zones/type";

export type RacksStatus =
    | 'ACTIVE'
    | 'INACTIVE';



export interface SubZone {
    id: number;
    name: string;
    code: string;
    zone : Zone
}

export interface RacksRecord {
    id: number;
    name: string;
    code: string;
    description: string | null;
    status: RacksStatus;
    subZoneId: string;
    subZone: SubZone;
    createdAt: string;
    updatedAt: string;
}

export interface RacksMeta {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

export interface RacksResponse {
    data: RacksRecord[];
    meta: RacksMeta;
}

export interface QueryRacksParams {
    page?: number;
    limit?: number;
    search?: string;
    status?: RacksStatus;
}