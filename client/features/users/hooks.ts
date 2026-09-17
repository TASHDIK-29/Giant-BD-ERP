'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { createUser, getUsers } from './api';

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




export function useCreateUser() {
    const queryClient =
        useQueryClient();

    return useMutation({
        mutationFn:
            createUser,

        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: ['users'],
            });
        },
    });
}