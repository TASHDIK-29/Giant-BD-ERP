'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

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
    const queryClient =
        useQueryClient();

    return useMutation({
        mutationFn:
            createCategory,


        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: ['categories'],
            });
        },
    });
}


export function useCreateSubCategory() {
    const queryClient =
        useQueryClient();

    return useMutation({
        mutationFn:
            createSubCategory,


        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: ['categories'],
            });
        },
    });
}



