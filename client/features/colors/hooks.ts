'use client';

import { useMutation, useQuery } from '@tanstack/react-query';
import { QueryColorsParams } from './type';
import { createColor, getColors } from './api';



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






export function useCreateColor() {
    return useMutation({
        mutationFn:
            createColor,
    });
}





