'use client';

import { useMutation, useQuery } from '@tanstack/react-query';

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
    return useMutation({
        mutationFn: createPermissionGroup,
    });
}