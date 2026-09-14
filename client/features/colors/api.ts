import { api } from '@/lib/axios';
import { ColorsResponse, QueryColorsParams } from './type';


export async function getColors(
    params: QueryColorsParams = {},
): Promise<ColorsResponse> {
    const response =
        await api.get<ColorsResponse>(
            '/colors',
            {
                params,
            },
        );

    return response.data;
}