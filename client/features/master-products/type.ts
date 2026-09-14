
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


/**
        {
            "id": 6,
            "name": "Test Master Product 2",
            "sku": "TEST-MASTER-PRODUCT-2-ELECTRONIC-DEVICES",
            "categoryId": 1,
            "subCategoryId": null,
            "materialId": 6,
            "status": "ACTIVE",
            "createdAt": "2026-09-10T13:15:12.708Z",
            "updatedAt": "2026-09-10T13:15:12.708Z",
            "category": {
                "id": 1,
                "name": "Electronic Devices",
                "slug": "electronic-devices"
            },
            "subCategory": null,
            "material": {
                "id": 6,
                "name": "Iron"
            },
            "_count": {
                "variants": 6
            }
        },


        {
            "id": 4,
            "name": "Mens Shirt",
            "sku": "MENS-SHIRT-CLOTH",
            "categoryId": 5,
            "subCategoryId": 8,
            "materialId": 1,
            "status": "ACTIVE",
            "createdAt": "2026-09-09T12:48:23.327Z",
            "updatedAt": "2026-09-09T12:48:23.327Z",
            "category": {
                "id": 5,
                "name": "Cloth",
                "slug": "cloth"
            },
            "subCategory": {
                "id": 8,
                "name": "Polyester",
                "slug": "polyester"
            },
            "material": {
                "id": 1,
                "name": "Cotton"
            },
            "_count": {
                "variants": 4
            }
        },
  
 */