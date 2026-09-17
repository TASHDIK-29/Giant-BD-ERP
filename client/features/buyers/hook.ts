'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { QueryBuyersParams } from './type';
import { createBuyer, getBuyers } from './api';



export function useBuyers(
    params: QueryBuyersParams,
    refreshKey = 0,
) {
    return useQuery({
        queryKey: [
            'buyers',
            params,
            refreshKey,
        ],

        queryFn: () =>
            getBuyers(params),

        placeholderData: (
            previousData,
        ) => previousData,
    });
}



export function useCreateBuyer() {
    const queryClient =
        useQueryClient();

    return useMutation({
        mutationFn:
            createBuyer,

        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: ['buyers'],
            });
        },
    });
}