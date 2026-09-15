import { api } from '@/lib/axios';
import { BatchListResponse, QueryBatchListParams } from './type';


export async function getBatchList(
    params: QueryBatchListParams = {},
): Promise<BatchListResponse> {
    const response =
        await api.get<BatchListResponse>(
            '/stock-in',
            {
                params,
            },
        );

    return response.data;
}