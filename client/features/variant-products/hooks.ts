'use client';

import { useMutation, useQuery } from '@tanstack/react-query';
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
    return useMutation({
        mutationFn:
            createVariantProduct,
    });
}