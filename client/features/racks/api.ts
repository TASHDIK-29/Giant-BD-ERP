import { api } from '@/lib/axios';
import { CreateRackRequest, CreateRackResponse, QueryRacksParams, RacksResponse } from './type';


export async function getRacks(
    params: QueryRacksParams = {},
): Promise<RacksResponse> {
    const response =
        await api.get<RacksResponse>(
            '/racks',
            {
                params,
            },
        );

    return response.data;
}





export async function createRack(
    data: CreateRackRequest,
): Promise<CreateRackResponse> {
    const response =
        await api.post<CreateRackResponse>(
            '/racks',
            data,
        );

    return response.data;
}