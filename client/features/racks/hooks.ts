'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { QueryRacksParams } from './type';
import { createRack, getRacks } from './api';



export function useRacks(
    params: QueryRacksParams,
    refreshKey = 0,
) {
    return useQuery({
        queryKey: [
            'racks',
            params,
            refreshKey,
        ],

        queryFn: () =>
            getRacks(params),

        placeholderData: (
            previousData,
        ) => previousData,
    });
}






export function useCreateRack() {
    const queryClient =
        useQueryClient();

    return useMutation({
        mutationFn:
            createRack,

        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: ['racks'],
            });
        },
    });
}