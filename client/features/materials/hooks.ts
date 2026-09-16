'use client';

import { useMutation, useQuery } from '@tanstack/react-query';
import { QueryMaterialsParams } from './types';
import { createMaterial, getMaterials } from './api';



export function useMaterials(
    params: QueryMaterialsParams,
    refreshKey = 0,
) {
    return useQuery({
        queryKey: [
            'materias',
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
    return useMutation({
        mutationFn:
            createMaterial,
    });
}