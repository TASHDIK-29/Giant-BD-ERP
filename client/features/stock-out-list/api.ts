import { api } from '@/lib/axios';
import { QueryStockOutListParams, StockOutListResponse } from './type';


export async function getStockOutList(
    params: QueryStockOutListParams = {},
): Promise<StockOutListResponse> {
    const response =
        await api.get<StockOutListResponse>(
            '/stock-outs',
            {
                params,
            },
        );

    return response.data;
}