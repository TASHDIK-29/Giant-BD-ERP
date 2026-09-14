import { api } from '@/lib/axios';

import type {
    CategoriesResponse,
    QueryCategoriesParams,
} from './types';

export async function getCategories(
    params: QueryCategoriesParams = {},
): Promise<CategoriesResponse> {
    const response =
        await api.get<CategoriesResponse>(
            '/categories',
            {
                params,
            },
        );

    return response.data;
}