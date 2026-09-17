'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
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
    const queryClient =
        useQueryClient();

    return useMutation({
        mutationFn:
            createColor,

        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: ['colors'],
            });
        },
    });
}





