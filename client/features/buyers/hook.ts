'use client';

import { useMutation, useQuery } from '@tanstack/react-query';
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
    return useMutation({
        mutationFn:
            createBuyer,
    });
}