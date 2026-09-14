'use client';

import { useQuery } from '@tanstack/react-query';

import { getRoles } from './api';

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