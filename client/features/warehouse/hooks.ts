'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
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
    const queryClient =
        useQueryClient();

    return useMutation({
        mutationFn:
            createWarehouse,

        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: ['warehouse'],
            });
        },
    });
}
