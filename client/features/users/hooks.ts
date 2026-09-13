'use client';

import { useQuery } from '@tanstack/react-query';

import { getUsers } from './api';

import type {
    QueryUsersParams,
} from './types';

export function useUsers(
    params: QueryUsersParams,
    refreshKey = 0,
) {
    return useQuery({
        queryKey: [
            'users',
            params,
            refreshKey,
        ],
        queryFn: () => getUsers(params),
        placeholderData: (
            previousData,
        ) => previousData,
    });
}