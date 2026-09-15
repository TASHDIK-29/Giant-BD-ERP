
export type BatchListStatus =
    | 'ACTIVE'
    | 'INACTIVE';



export interface Category {
    id: number;
    name: string;
    slug: string;
}


export interface Material {
    id: number;
    name: string;
}

export interface BatchListRecord {
    id: number;
    batchId: string;
    BatchListId: number;
    colorId: number;
    gender: string;
    stockInDate: string;
    productionDate: string;
    expiryDate: string | null;
    totalQuantity: number;
    totalPackages: number;
    createdById: number;
    masterProduct:{
        id: number;
        name : string;
        sku: string;
    };
    color:{
        id: number;
        name : string;
    };
    createdBy:{
        id: number;
        name : string;
        email: string;
    };
    itemCount: number;

    createdAt: string;
    updatedAt: string;
}

export interface BatchListMeta {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

export interface BatchListResponse {
    data: BatchListRecord[];
    meta: BatchListMeta;
}

export interface QueryBatchListParams {
    page?: number;
    limit?: number;
    search?: string;
    status?: BatchListStatus;
}


/**
        {
            "id": 17,
            "batchId": "STI-20260910-340980",
            "BatchListId": 6,
            "colorId": 2,
            "gender": "FEMALE",
            "stockInDate": "2026-09-23T00:00:00.000Z",
            "productionDate": "2026-09-10T00:00:00.000Z",
            "expiryDate": null,
            "totalQuantity": 99,
            "totalPackages": 10,
            "createdById": 1,
            "createdAt": "2026-09-10T13:20:14.882Z",
            "updatedAt": "2026-09-10T13:20:14.882Z",
            "BatchList": {
                "id": 6,
                "name": "Test Master Product 2",
                "sku": "TEST-MASTER-PRODUCT-2-ELECTRONIC-DEVICES"
            },
            "color": {
                "id": 2,
                "name": "White"
            },
            "createdBy": {
                "id": 1,
                "name": "Super Admin",
                "email": "super@admin.com"
            },
            "itemCount": 6
        },

  
 */