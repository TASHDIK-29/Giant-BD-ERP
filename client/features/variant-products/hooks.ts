'use client';

import { useQuery } from '@tanstack/react-query';
import { QueryVariantProductParams } from './type';
import { getVariantProduct } from './api';



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