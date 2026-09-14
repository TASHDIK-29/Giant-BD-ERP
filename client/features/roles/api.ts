import { api } from '@/lib/axios';

import type {
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