import { api } from '@/lib/axios';

import type {
    CreateMaterialRequest,
    CreateMaterialResponse,
    MaterialsResponse,
    QueryMaterialsParams,
} from './types';

export async function getMaterials(
    params: QueryMaterialsParams = {},
): Promise<MaterialsResponse> {
    const response =
        await api.get<MaterialsResponse>(
            '/materials',
            {
                params,
            },
        );

    return response.data;
}




export async function createMaterial(
    data: CreateMaterialRequest,
): Promise<CreateMaterialResponse> {
    const response =
        await api.post<CreateMaterialResponse>(
            '/materials',
            data,
        );

    return response.data;
}


