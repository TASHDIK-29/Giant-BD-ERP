import { api } from '@/lib/axios';
import { QueryRacksParams, RacksResponse } from './type';


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