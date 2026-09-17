'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { QueryMaterialsParams } from './types';
import { createMaterial, getMaterials } from './api';



export function useMaterials(
    params: QueryMaterialsParams,
    refreshKey = 0,
) {
    return useQuery({
        queryKey: [
            'materials',
            params,
            refreshKey,
        ],

        queryFn: () =>
            getMaterials(params),

        placeholderData: (
            previousData,
        ) => previousData,
    });
}



export function useCreateMaterial() {
    const queryClient =
        useQueryClient();

    return useMutation({
        mutationFn:
            createMaterial,

        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: ['materials'],
            });
        },
    });
}