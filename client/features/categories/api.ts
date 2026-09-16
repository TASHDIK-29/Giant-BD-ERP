import { api } from '@/lib/axios';

import type {
    CategoriesResponse,
    CreateCategoryRequest,
    CreateCategoryResponse,
    CreateSubCategoryRequest,
    CreateSubCategoryResponse,
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





export async function createCategory(
    data: CreateCategoryRequest,
): Promise<CreateCategoryResponse> {
    const response =
        await api.post<CreateCategoryResponse>(
            '/categories',
            data,
        );

    return response.data;
}



export async function createSubCategory(
    data: CreateSubCategoryRequest,
): Promise<CreateSubCategoryResponse> {
    const response =
        await api.post<CreateSubCategoryResponse>(
            '/categories/sub-categories',
            data,
        );

    return response.data;
}