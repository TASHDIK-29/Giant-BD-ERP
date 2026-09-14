'use client';

import { useQuery } from '@tanstack/react-query';
import { QueryBuyersParams } from './type';
import { getBuyers } from './api';



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