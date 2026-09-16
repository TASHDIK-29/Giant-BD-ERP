import { api } from '@/lib/axios';
import { CreateZoneRequest, CreateZoneResponse, QueryZoneParams, ZoneResponse } from './type';
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





export async function createZone(
    data: CreateZoneRequest,
): Promise<CreateZoneResponse> {
    const response =
        await api.post<CreateZoneResponse>(
            '/zones',
            data,
        );

    return response.data;
}