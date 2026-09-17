import type { AuthPermission } from '@/features/auth/types';

import {
    routePermissions,
} from '@/constants/route-permissions';

const defaultRoutes = [
    '/dashboard',
    '/role',
    '/permission',
    '/user',
    '/master-fg-product',
    '/variant-fg-product',
    '/buyer',
    '/category',
    '/sub-category',
    '/material',
    '/color',
    '/warehouse',
    '/zone',
    '/sub-zone',
    '/rack',
];

export function getDefaultRoute(
    permissions: AuthPermission[],
): string | null {
    for (const route of defaultRoutes) {
        const requiredPermission =
            routePermissions[route];

        // Route does not require permission.
        if (!requiredPermission) {
            continue;
        }

        const hasAccess =
            permissions.some(
                (permission) =>
                    permission.name ===
                    requiredPermission,
            );

        if (hasAccess) {
            return route;
        }
    }

    return null;
}