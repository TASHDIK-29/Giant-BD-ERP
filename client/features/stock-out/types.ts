export type Gender = 'MALE' | 'FEMALE';

export type BuyerType =
    | 'LOCAL'
    | 'INTERNATIONAL';

export interface BuyerPurchaseOrder {
    id: number;
    poNumber: string;
}

export interface BuyerLetterOfCredit {
    id: number;
    lcNumber: string;
    purchaseOrders: BuyerPurchaseOrder[];
}

export interface Buyer {
    id: number;
    name: string;
    type: BuyerType;
    status: string;
    lettersOfCredit: BuyerLetterOfCredit[];
}

export interface CreateLetterOfCreditPayload {
    buyerId: number;
    lcNumber: string;
}

export interface CreatePurchaseOrderPayload {
    letterOfCreditId: number;
    poNumber: string;
}

export interface MasterProduct {
    id: number;
    name: string;
    sku: string;
    material?: {
        id: number;
        name: string;
    } | null;
}

export interface ProductVariant {
    id: number;
    masterProductId: number;
    colorId: number;
    gender: Gender;
    size: string;
    sku: string;
    modelNumber: string | null;
    uom: string;
    productsPerPacket: number | null;
    packagingType: string | null;
    status: string;
    color: {
        id: number;
        name: string;
    };
}

export interface StockInListItem {
    id: number;
    batchId: string;
    masterProductId: number;
    colorId: number;
    gender: Gender;
    stockInDate: string;
    productionDate: string;
    expiryDate: string | null;
    totalQuantity: number;
    totalPackages: number;
    itemCount: number;
}

export interface StockInItem {
    id: number;
    stockInId: number;
    productVariantId: number;
    quantity: number;

    warehouseId: number;
    zoneId: number;
    subZoneId: number;
    rackId: number;

    productVariant: {
        id: number;
        size: string;
        sku: string;
        gender: Gender;
        modelNumber: string | null;
        uom: string;
        productsPerPacket: number | null;
        packagingType: string | null;
    };

    warehouse: {
        id: number;
        name: string;
        code: string;
    };

    zone: {
        id: number;
        name: string;
        code: string;
    };

    subZone: {
        id: number;
        name: string;
        code: string;
    };

    rack: {
        id: number;
        name: string;
        code: string;
    };
}

export interface StockInDetail
    extends StockInListItem {
    masterProduct: {
        id: number;
        name: string;
        sku: string;
        material?: {
            id: number;
            name: string;
        } | null;
    };

    color: {
        id: number;
        name: string;
    };

    items: StockInItem[];
}

export interface StockInListResponse {
    data: StockInListItem[];
    meta: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export interface StockInDetailResponse {
    data: StockInDetail;
}

export interface StockOutItemPayload {
    batchId: string;
    productVariantId: number;
    quantity: number;
}

export interface CreateStockOutPayload {
    buyerId: number;
    letterOfCreditId: number;
    purchaseOrderId: number;
    masterProductId: number;
    colorId: number;
    gender: Gender;
    requestDate: string;
    stockOutDate?: string;
    items: StockOutItemPayload[];
}

export interface DispatchItem {
    id: string;
    batchId: string;
    productVariantId: number;
    size: string;
    colorName: string;

    warehouseName: string;
    zoneName: string;
    subZoneName: string;
    rackName: string;

    quantity: number;
    availableQuantity: number;
}