export type CategoryStatus =
    | 'ACTIVE'
    | 'INACTIVE';

export type CategoryType =
    | 'CATEGORY'
    | 'SUB_CATEGORY';

export interface CategoryParent {
    id: number;
    name: string;
    slug: string;
}

export interface CategoryRecord {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    type: CategoryType;
    parentId: number | null;
    parent: CategoryParent | null;
    mediaId: number | null;
    status: CategoryStatus;
    sortOrder: number;
    childrenCount: number;
    createdAt: string;
    updatedAt: string;
}

export interface CategoriesMeta {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

export interface CategoriesResponse {
    data: CategoryRecord[];
    meta: CategoriesMeta;
}

export interface QueryCategoriesParams {
    page?: number;
    limit?: number;
    search?: string;
    status?: CategoryStatus;
    type?: CategoryType;
}




/* Create Category */

export interface CreateCategoryRequest {
    name: string;
    description?: string;
}

export interface CreateCategoryResponse {
    message: string;
}


/* Create Sub Category */

export interface CreateSubCategoryRequest {
    name: string;
    description?: string;
    parentId: string;
}

export interface CreateSubCategoryResponse {
    message: string;
}