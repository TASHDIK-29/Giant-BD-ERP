import { api } from '@/lib/axios';
import { QueryZoneParams, ZoneResponse } from './type';
// import { QueryWarehouseParams, WarehouseResponse } from './type';


export async function getZones(
    params: QueryZoneParams = {},
): Promise<ZoneResponse> {
    const response =
        await api.get<ZoneResponse>(
            '/zones',
            {
                params,
            },
        );

    return response.data;
}