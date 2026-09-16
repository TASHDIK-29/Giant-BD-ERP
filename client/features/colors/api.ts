import { api } from '@/lib/axios';
import { ColorsResponse, CreateColorRequest, CreateColorResponse, QueryColorsParams } from './type';


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






export async function createColor(
    data: CreateColorRequest,
): Promise<CreateColorResponse> {
    const response =
        await api.post<CreateColorResponse>(
            '/colors',
            data,
        );

    return response.data;
}












