import { api } from '@/lib/axios';
import { MasterProductResponse, QueryMasterProductParams } from './type';
// import { QueryRacksParams, RacksResponse } from './type';


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