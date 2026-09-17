'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { QueryMasterProductParams } from './type';
import { getMasterProduct } from './api';




import {
    createMasterProduct,
} from './api';

export function useCreateMasterProduct() {
    const queryClient =
        useQueryClient();

    return useMutation({
        mutationFn:
            createMasterProduct,

        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: ['masterProduct'],
            });
        },
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