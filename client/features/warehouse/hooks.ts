'use client';

import { useQuery } from '@tanstack/react-query';
import { getWarehouse } from './api';
import { QueryWarehouseParams } from './type';



export function useWarehouse(
    params: QueryWarehouseParams,
    refreshKey = 0,
) {
    return useQuery({
        queryKey: [
            'materias',
            params,
            refreshKey,
        ],

        queryFn: () =>
            getWarehouse(params),

        placeholderData: (
            previousData,
        ) => previousData,
    });
}