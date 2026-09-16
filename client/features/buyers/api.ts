import { api } from '@/lib/axios';
import { BuyersResponse, CreateBuyerRequest, CreateBuyerResponse, QueryBuyersParams } from './type';


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



export async function createBuyer(
    data: CreateBuyerRequest,
): Promise<CreateBuyerResponse> {
    const response =
        await api.post<CreateBuyerResponse>(
            '/buyers',
            data,
        );

    return response.data;
}