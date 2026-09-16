import { api } from '@/lib/axios';
import { MasterProductResponse, QueryMasterProductParams } from './type';
// import { QueryRacksParams, RacksResponse } from './type';

import type {
    CreateMasterProductRequest,
    CreateMasterProductResponse,
} from './type';

export async function createMasterProduct(
    data: CreateMasterProductRequest,
): Promise<CreateMasterProductResponse> {
    const response =
        await api.post<CreateMasterProductResponse>(
            '/products/master',
            data,
        );

    return response.data;
}


export async function getMasterProduct(
    params: QueryMasterProductParams = {},
): Promise<MasterProductResponse> {
    const response =
        await api.get<MasterProductResponse>(
            '/products/master',
            {
                params,
            },
        );

    return response.data;
}