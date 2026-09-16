'use client';

import { useMutation, useQuery } from '@tanstack/react-query';

import { createCategory, createSubCategory, getCategories } from './api';

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



export function useCreateCategory() {
    return useMutation({
        mutationFn:
            createCategory,
    });
}


export function useCreateSubCategory() {
    return useMutation({
        mutationFn:
            createSubCategory,
    });
}



