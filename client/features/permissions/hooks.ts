'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { createPermissionGroup, getPermissionGroups } from './api';

import type {
    QueryPermissionGroupsParams,
} from './types';

export function usePermissionGroups(
    params: QueryPermissionGroupsParams,
    refreshKey = 0,
) {
    return useQuery({
        queryKey: [
            'permission-groups',
            params,
            refreshKey,
        ],

        queryFn: () =>
            getPermissionGroups(params),

        placeholderData: (
            previousData,
        ) => previousData,
    });
}


export function useCreatePermissionGroup() {
    const queryClient =
        useQueryClient();
    return useMutation({
        mutationFn: createPermissionGroup,

        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: ['permission-groups'],
            });
        },
    });
}