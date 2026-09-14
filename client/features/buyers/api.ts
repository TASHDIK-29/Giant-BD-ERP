import { api } from '@/lib/axios';
import { BuyersResponse, QueryBuyersParams } from './type';


export async function getBuyers(
    params: QueryBuyersParams = {},
): Promise<BuyersResponse> {
    const response =
        await api.get<BuyersResponse>(
            '/buyers',
            {
                params,
            },
        );

    // return response.data;
    return response.data;
}