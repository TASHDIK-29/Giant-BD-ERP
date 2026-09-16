import { api } from '@/lib/axios';

import type {
    CreateRolePayload,
    CreateRoleResponse,
    QueryRolesParams,
    RolesResponse,
} from './types';

export async function getRoles(
    params: QueryRolesParams = {},
): Promise<RolesResponse> {
    const response =
        await api.get<RolesResponse>(
            '/roles',
            {
                params,
            },
        );

    return response.data;
}



export async function createRole(
    payload: CreateRolePayload,
): Promise<CreateRoleResponse> {
    const response = await api.post<CreateRoleResponse>(
        '/roles',
        payload,
    );

    return response.data;
}