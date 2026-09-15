'use client';

import { useQuery } from '@tanstack/react-query';
import { QueryBatchListParams } from './type';
import { getBatchList } from './api';


export function useBatchList(
    params: QueryBatchListParams,
    refreshKey = 0,
) {
    return useQuery({
        queryKey: [
            'batchList',
            params,
            refreshKey,
        ],

        queryFn: () =>
            getBatchList(params),

        placeholderData: (
            previousData,
        ) => previousData,
    });
}