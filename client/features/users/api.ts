import { api } from '@/lib/axios';

import type {
    CreateUserRequest,
    CreateUserResponse,
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







export async function createUser(
    data: CreateUserRequest,
): Promise<CreateUserResponse> {
    const response =
        await api.post<CreateUserResponse>(
            '/users',
            data,
        );

    return response.data;
}