import { api } from '@/lib/axios';
import { CreateSubZoneRequest, CreateSubZoneResponse, QuerySubZoneParams, SubZoneResponse } from './type';
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





export async function createSubZone(
    data: CreateSubZoneRequest,
): Promise<CreateSubZoneResponse> {
    const response =
        await api.post<CreateSubZoneResponse>(
            '/sub-zones',
            data,
        );

    return response.data;
}