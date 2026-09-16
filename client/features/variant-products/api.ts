import { api } from '@/lib/axios';
import { CreateVariantProductRequest, CreateVariantProductResponse, QueryVariantProductParams, VariantProductResponse } from './type';


export async function getVariantProduct(
    params: QueryVariantProductParams = {},
): Promise<VariantProductResponse> {
    const response =
        await api.get<VariantProductResponse>(
            '/products/variants',
            {
                params,
            },
        );

    return response.data;
}



export async function createVariantProduct(
    data: CreateVariantProductRequest,
): Promise<CreateVariantProductResponse> {
    const response =
        await api.post<CreateVariantProductResponse>(
            '/products/variants',
            data,
        );

    return response.data;
}