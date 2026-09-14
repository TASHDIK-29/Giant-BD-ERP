'use client';

import { useQuery } from '@tanstack/react-query';
import { QueryColorsParams } from './type';
import { getColors } from './api';



export function useColors(
    params: QueryColorsParams,
    refreshKey = 0,
) {
    return useQuery({
        queryKey: [
            'colors',
            params,
            refreshKey,
        ],

        queryFn: () =>
            getColors(params),

        placeholderData: (
            previousData,
        ) => previousData,
    });
}