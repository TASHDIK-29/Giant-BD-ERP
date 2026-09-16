'use client';

import { useMutation, useQuery } from '@tanstack/react-query';
import { createWarehouse, getWarehouse } from './api';
import { QueryWarehouseParams } from './type';



export function useWarehouse(
    params: QueryWarehouseParams,
    refreshKey = 0,
) {
    return useQuery({
        queryKey: [
            'warehouse',
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




export function useCreateWarehouse() {
    return useMutation({
        mutationFn:
            createWarehouse,
    });
}
