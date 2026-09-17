'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createZone, getZones } from './api';
import { QueryZoneParams } from './type';
// import { QueryWarehouseParams } from './type';



export function useZone(
    params: QueryZoneParams,
    refreshKey = 0,
) {
    return useQuery({
        queryKey: [
            'zones',
            params,
            refreshKey,
        ],

        queryFn: () =>
            getZones(params),

        placeholderData: (
            previousData,
        ) => previousData,
    });
}





export function useCreateZone() {
    const queryClient =
        useQueryClient();

    return useMutation({
        mutationFn:
            createZone,

        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: ['zones'],
            });
        },
    });
}