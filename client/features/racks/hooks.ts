'use client';

import { useQuery } from '@tanstack/react-query';
import { QueryRacksParams } from './type';
import { getRacks } from './api';



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