'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { QuerySubZoneParams } from './type';
import { createSubZone, getSubZones } from './api';



export function useSubZone(
    params: QuerySubZoneParams,
    refreshKey = 0,
) {
    return useQuery({
        queryKey: [
            'sub-zones',
            params,
            refreshKey,
        ],

        queryFn: () =>
            getSubZones(params),

        placeholderData: (
            previousData,
        ) => previousData,
    });
}




export function useCreateSubZone() {
    const queryClient =
        useQueryClient();

    return useMutation({
        mutationFn:
            createSubZone,

        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: ['sub-zones'],
            });
        },
    });
}