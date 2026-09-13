import { api } from '@/lib/axios';

import type {
    QueryUsersParams,
    UsersResponse,
} from './types';

export async function getUsers(
    params: QueryUsersParams = {},
): Promise<UsersResponse> {
    const response = await api.get<UsersResponse>(
        '/users',
        {
            params,
        },
    );

    return response.data;
}