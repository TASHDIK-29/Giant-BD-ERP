'use client';

import { useMutation, useQuery } from '@tanstack/react-query';
import { QueryMasterProductParams } from './type';
import { getMasterProduct } from './api';




import {
    createMasterProduct,
} from './api';

export function useCreateMasterProduct() {
    return useMutation({
        mutationFn:
            createMasterProduct,
    });
}


export function useMasterProduct(
    params: QueryMasterProductParams,
    refreshKey = 0,
) {
    return useQuery({
        queryKey: [
            'masterProduct',
            params,
            refreshKey,
        ],

        queryFn: () =>
            getMasterProduct(params),

        placeholderData: (
            previousData,
        ) => previousData,
    });
}