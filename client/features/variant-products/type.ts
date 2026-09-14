/**
        {
            "id": 22,
            "masterProductId": 6,
            "colorId": 2,
            "gender": "FEMALE",
            "size": "456",
            "sku": "TEST-MASTER-PRODUCT-2-ELECTRONIC-DEVICES-456-COLOR-FEMALE",
            "modelNumber": null,
            "uom": "PCS",
            "productsPerPacket": 10,
            "packagingType": "PACKET",
            "status": "ACTIVE",
            "createdAt": "2026-09-10T13:16:58.292Z",
            "updatedAt": "2026-09-10T13:16:58.292Z",
            "masterProduct": {
                "id": 6,
                "name": "Test Master Product 2",
                "sku": "TEST-MASTER-PRODUCT-2-ELECTRONIC-DEVICES",
                "status": "ACTIVE"
            },
            "color": {
                "id": 2,
                "name": "White"
            }
        },
 */




export type VariantProductStatus =
    | 'ACTIVE'
    | 'INACTIVE';



export interface VariantProductRecord {
    id: number;
    masterProductId: number;
    colorId: number;
    gender: string;
    size: string;
    sku: string;
    modelNumber: string | null;
    uom: string;
    productsPerPacket: number;
    packagingType: string;
    status: VariantProductStatus;
    masterProduct: {
        id: number;
        name: string;
        sku: string;
        status: VariantProductStatus;
    };
    color: {
        id: number;
        name: string;
    };
    createdAt: string;
    updatedAt: string;
}

export interface VariantProductMeta {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

export interface VariantProductResponse {
    data: VariantProductRecord[];
    meta: VariantProductMeta;
}

export interface QueryVariantProductParams {
    page?: number;
    limit?: number;
    search?: string;
    status?: VariantProductStatus;
}

