'use client';

import { useQuery } from '@tanstack/react-query';
import { QueryStockOutListParams } from './type';
import { getStockOutList } from './api';


export function useStockOutList(
    params: QueryStockOutListParams,
    refreshKey = 0,
) {
    return useQuery({
        queryKey: [
            'stockOut',
            params,
            refreshKey,
        ],

        queryFn: () =>
            getStockOutList(params),

        placeholderData: (
            previousData,
        ) => previousData,
    });
}