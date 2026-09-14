export type MaterialsStatus =
    | 'ACTIVE'
    | 'INACTIVE';



export interface MaterialsRecord {
    id: number;
    name: string;
    description: string | null;
    status: MaterialsStatus;
    createdAt: string;
    updatedAt: string;
}

export interface MaterialsMeta {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

export interface MaterialsResponse {
    data: MaterialsRecord[];
    meta: MaterialsMeta;
}

export interface QueryMaterialsParams {
    page?: number;
    limit?: number;
    search?: string;
    status?: MaterialsStatus;
}