import { api } from '@/lib/axios';

import type {
    CreatePermissionGroupPayload,
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





export async function createPermissionGroup(
    payload: CreatePermissionGroupPayload,
) {
    const response = await api.post(
        '/permissions/groups',
        payload,
    );

    return response.data;
}