import { api } from '@/lib/axios';
import { QueryVariantProductParams, VariantProductResponse } from './type';


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