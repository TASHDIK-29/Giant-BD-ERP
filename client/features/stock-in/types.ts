export type Gender = 'MALE' | 'FEMALE';

export interface MasterProduct {
    id: number;
    name: string;
    sku: string;
    materialId: number;
    status: string;

    material: {
        id: number;
        name: string;
    };

    category?: {
        id: number;
        name: string;
        slug: string;
    };

    subCategory?: {
        id: number;
        name: string;
        slug: string;
    };
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
    productsPerPacket: number;
    packagingType: string;
    status: string;

    masterProduct: {
        id: number;
        name: string;
        sku: string;
        status: string;
    };

    color: {
        id: number;
        name: string;
    };
}

export interface Warehouse {
    id: number;
    name: string;
    code: string;
    status: string;
}

export interface Zone {
    id: number;
    name: string;
    code: string;
    status: string;
    warehouseId: number;
}

export interface SubZone {
    id: number;
    name: string;
    code: string;
    status: string;
    zoneId: number;
}

export interface Rack {
    id: number;
    name: string;
    code: string;
    status: string;
    subZoneId: number;
}

export interface PaginatedResponse<T> {
    data: T[];
    meta: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}

export interface StockInItemPayload {
    size: string;
    quantity: number;
    warehouseId: number;
    zoneId: number;
    subZoneId: number;
    rackId: number;
}

export interface CreateStockInPayload {
    masterProductId: number;
    colorId: number;
    gender: Gender;
    stockInDate: string;
    productionDate: string;
    expiryDate?: string;
    items: StockInItemPayload[];
}

export interface StockInResponse {
    message: string;
    data: {
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
    };
}

export interface StockInRow {
    size: string;
    quantity: number;
    warehouseId: string;
    zoneId: string;
    subZoneId: string;
    rackId: string;
}