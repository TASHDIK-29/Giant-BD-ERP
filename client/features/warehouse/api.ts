import { api } from '@/lib/axios';
import { QueryWarehouseParams, WarehouseResponse } from './type';

// import type {
//     MaterialsResponse,
//     QueryMaterialsParams,
// } from './types';

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