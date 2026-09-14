'use client';

import { useQuery } from '@tanstack/react-query';
import { QueryMasterProductParams } from './type';
import { getMasterProduct } from './api';



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