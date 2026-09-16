'use client';

import { useMutation, useQuery } from '@tanstack/react-query';
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
    return useMutation({
        mutationFn:
            createRack,
    });
}