import { api } from '@/lib/axios';

import type {
    PermissionGroupsResponse,
    QueryPermissionGroupsParams,
} from './types';

export async function getPermissionGroups(
    params: QueryPermissionGroupsParams = {},
): Promise<PermissionGroupsResponse> {
    const response =
        await api.get<PermissionGroupsResponse>(
            '/permissions/groups',
            {
                params,
            },
        );

    return response.data;
}