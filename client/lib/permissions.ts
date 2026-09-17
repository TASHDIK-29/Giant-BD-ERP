import type { AuthPermission } from '@/features/auth/types';

export function hasPermission(
    permissions: AuthPermission[],
    requiredPermission: string,
): boolean {
    return permissions.some(
        (permission) =>
            permission.name === requiredPermission,
    );
}

export function hasAnyPermission(
    permissions: AuthPermission[],
    requiredPermissions: string[],
): boolean {
    return requiredPermissions.some(
        (requiredPermission) =>
            hasPermission(
                permissions,
                requiredPermission,
            ),
    );
}

export function hasAllPermissions(
    permissions: AuthPermission[],
    requiredPermissions: string[],
): boolean {
    return requiredPermissions.every(
        (requiredPermission) =>
            hasPermission(
                permissions,
                requiredPermission,
            ),
    );
}