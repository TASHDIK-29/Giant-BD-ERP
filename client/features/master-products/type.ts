
export type MasterProductStatus =
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

export interface MasterProductRecord {
    id: number;
    name: string;
    sku: string;
    categoryId: number;
    subCategoryId: number | null;
    materialId: number;
    status: MasterProductStatus;
    category : Category;
    subCategory : Category | null;
    material: Material
    _count: {
        variants : number;
    }

    createdAt: string;
    updatedAt: string;
}

export interface MasterProductMeta {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

export interface MasterProductResponse {
    data: MasterProductRecord[];
    meta: MasterProductMeta;
}

export interface QueryMasterProductParams {
    page?: number;
    limit?: number;
    search?: string;
    status?: MasterProductStatus;
}

export interface CreateMasterProductRequest {
    name: string;
    categoryId: number;
    subCategoryId?: number;
    materialId: number;
}

export interface CreateMasterProductResponse {
    message: string;
}