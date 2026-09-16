



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



/* Create Variant Types */

export type VariantGender =
    | 'MALE'
    | 'FEMALE'
    | 'KIDS';

export type VariantUom =
    | 'PAIR'
    | 'LEFT'
    | 'RIGHT';

export type PackagingType =
    | 'BOX'
    | 'CARTON'
    | 'PACKET'
    | 'POLYBAG';

export type VariantStatus =
    | 'ACTIVE'
    | 'INACTIVE';



export interface CreateVariantProductRequest {
    masterProductId: number;
    colorId: number;
    gender: VariantGender;
    sizes: string[];
    uom: VariantUom;
    productsPerPacket: number;
    packagingType: PackagingType;
    modelNumber?: string;
    status: VariantStatus;
}

export interface CreateVariantProductResponse {
    message: string;
}