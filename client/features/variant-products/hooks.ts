'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { QueryVariantProductParams } from './type';
import { createVariantProduct, getVariantProduct } from './api';



export function useVariantProduct(
    params: QueryVariantProductParams,
    refreshKey = 0,
) {
    return useQuery({
        queryKey: [
            'variantProduct',
            params,
            refreshKey,
        ],

        queryFn: () =>
            getVariantProduct(params),

        placeholderData: (
            previousData,
        ) => previousData,
    });
}




export function useCreateVariantProduct() {
    const queryClient =
        useQueryClient();

    return useMutation({
        mutationFn:
            createVariantProduct,

        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: ['variantProduct'],
            });
        },
    });
}