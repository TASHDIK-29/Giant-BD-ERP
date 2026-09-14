'use client';

import { useQuery } from '@tanstack/react-query';

import { getCategories } from './api';

import type {
    QueryCategoriesParams,
} from './types';

export function useCategories(
    params: QueryCategoriesParams,
    refreshKey = 0,
) {
    return useQuery({
        queryKey: [
            'categories',
            params,
            refreshKey,
        ],

        queryFn: () =>
            getCategories(params),

        placeholderData: (
            previousData,
        ) => previousData,
    });
}