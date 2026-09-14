import { api } from '@/lib/axios';

import type {
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