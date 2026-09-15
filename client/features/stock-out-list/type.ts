
export type Status =
    | 'ACTIVE'
    | 'INACTIVE';



interface Item {
    id: number;
    StockOutId: string;
    productVariantId: number;
    quantity: number;
    productVariant: {
        id: number;
        size: string;
        sku: string;
        modelNumber: string;
        gender: string;
        uom: string;
        productsPerPacket: number;
        packagingType: string;
    }
}

export interface StockOutListRecord {

    id: number;
    stockOutNumber: string;
    buyerId: number;
    letterOfCreditId: number;
    purchaseOrderId: number;
    masterProductId: number;
    colorId: number;
    gender: "MALE",
    requestDate: string;
    stockOutDate: string | null;
    status: string;
    createdById: number;
    createdAt: string;
    updatedAt: string;
    buyer: {
        "id": number;
        "name": string;
        "type": string;
        "status": Status;
    },
    letterOfCredit: {
        "id": number;
        "lcNumber": string;
        "buyerId": number;
    },
    purchaseOrder: {
        "id": number;
        "poNumber": string;
        "letterOfCreditId": number;
    },
    masterProduct: {
        "id": number;
        "name": string;
        "sku": string;
        "status": Status;
    },
    color: {
        "id": number;
        "name": string;
    },
    createdBy: {
        "id": number;
        "name": string;
        "email": string;
    },
    items: Item[];
    _count: {
        "items": number;
    }

}

export interface StockOutListMeta {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
}

export interface StockOutListResponse {
    data: StockOutListRecord[];
    meta: StockOutListMeta;
}

export interface QueryStockOutListParams {
    page?: number;
    limit?: number;
    search?: string;
    status?: Status;
}


/**
        {
            "id": 4,
            "stockOutNumber": "SO-1789046798790-EDBF2A1C",
            "buyerId": 1,
            "letterOfCreditId": 1,
            "purchaseOrderId": 1,
            "masterProductId": 4,
            "colorId": 1,
            "gender": "MALE",
            "requestDate": "2026-09-10T00:00:00.000Z",
            "stockOutDate": null,
            "status": "ISSUED",
            "createdById": 1,
            "createdAt": "2026-09-10T13:26:38.839Z",
            "updatedAt": "2026-09-10T13:26:38.839Z",
            "buyer": {
                "id": 1,
                "name": "TD Treading",
                "type": "LOCAL",
                "status": "ACTIVE"
            },
            "letterOfCredit": {
                "id": 1,
                "lcNumber": "LC-2026-001",
                "buyerId": 1
            },
            "purchaseOrder": {
                "id": 1,
                "poNumber": "PO-2026-001",
                "letterOfCreditId": 1
            },
            "masterProduct": {
                "id": 4,
                "name": "Mens Shirt",
                "sku": "MENS-SHIRT-CLOTH",
                "status": "ACTIVE"
            },
            "color": {
                "id": 1,
                "name": "Red"
            },
            "createdBy": {
                "id": 1,
                "name": "Super Admin",
                "email": "super@admin.com"
            },
            "items": [
                {
                    "id": 7,
                    "StockOutId": "STI-20260910-346812",
                    "productVariantId": 10,
                    "quantity": 10,
                    "productVariant": {
                        "id": 10,
                        "size": "43",
                        "sku": "MENS-SHIRT-CLOTH-43-COLOR-MALE",
                        "modelNumber": "1",
                        "gender": "MALE",
                        "uom": "PAIR",
                        "productsPerPacket": 10,
                        "packagingType": "BOX"
                    }
                },
                {
                    "id": 8,
                    "StockOutId": "STI-20260910-346812",
                    "productVariantId": 7,
                    "quantity": 15,
                    "productVariant": {
                        "id": 7,
                        "size": "49",
                        "sku": "MENS-SHIRT-CLOTH-49-COLOR-MALE",
                        "modelNumber": "1",
                        "gender": "MALE",
                        "uom": "PAIR",
                        "productsPerPacket": 10,
                        "packagingType": "BOX"
                    }
                }
            ],
            "_count": {
                "items": 2
            }
        },

  
 */