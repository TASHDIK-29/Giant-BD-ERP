import { api } from '@/lib/axios';
import { QuerySubZoneParams, SubZoneResponse } from './type';
// import { QueryZoneParams, ZoneResponse } from './type';
// import { QueryWarehouseParams, WarehouseResponse } from './type';


export async function getSubZones(
    params: QuerySubZoneParams = {},
): Promise<SubZoneResponse> {
    const response =
        await api.get<SubZoneResponse>(
            '/sub-zones',
            {
                params,
            },
        );

    return response.data;
}