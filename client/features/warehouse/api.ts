import { api } from '@/lib/axios';
import { CreateWarehouseRequest, CreateWarehouseResponse, QueryWarehouseParams, WarehouseResponse } from './type';


export async function getWarehouse(
    params: QueryWarehouseParams = {},
): Promise<WarehouseResponse> {
    const response =
        await api.get<WarehouseResponse>(
            '/warehouses',
            {
                params,
            },
        );

    return response.data;
}





export async function createWarehouse(
    data: CreateWarehouseRequest,
): Promise<CreateWarehouseResponse> {
    const response =
        await api.post<CreateWarehouseResponse>(
            '/warehouses',
            data,
        );

    return response.data;
}