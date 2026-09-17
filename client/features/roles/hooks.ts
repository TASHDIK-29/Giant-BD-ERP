'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { createRole, getRoles } from './api';

import type {
    QueryRolesParams,
} from './types';

export function useRoles(
    params: QueryRolesParams,
    refreshKey = 0,
) {
    return useQuery({
        queryKey: [
            'roles',
            params,
            refreshKey,
        ],

        queryFn: () =>
            getRoles(params),

        placeholderData: (
            previousData,
        ) => previousData,
    });
}



export function useCreateRole() {
    const queryClient =
        useQueryClient();

    return useMutation({
        mutationFn: createRole,

        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: ['roles'],
            });
        },
    });
}