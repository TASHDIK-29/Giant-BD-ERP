'use client';

import {
    useEffect,
} from 'react';

import {
    usePathname,
    useRouter,
} from 'next/navigation';

import {
    useAuth,
} from '@/features/auth/auth-provider';

import {
    routePermissions,
} from '@/constants/route-permissions';

interface PermissionGuardProps {
    children: React.ReactNode;
}

export function PermissionGuard({
    children,
}: PermissionGuardProps) {
    const pathname =
        usePathname();

    const router =
        useRouter();

    const {
        session,
        isLoading,
        isAuthenticated,
        hasPermission,
    } = useAuth();

    useEffect(() => {
        if (isLoading) {
            return;
        }

        if (!isAuthenticated) {
            return;
        }

        const requiredPermission =
            routePermissions[
                pathname
            ];

        // No permission rule means
        // the route is allowed.
        if (!requiredPermission) {
            return;
        }

        if (
            !hasPermission(
                requiredPermission,
            )
        ) {
            router.replace(
                '/dashboard',
            );
        }
    }, [
        pathname,
        isLoading,
        isAuthenticated,
        session,
        hasPermission,
        router,
    ]);

    if (isLoading) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center">
                <p className="text-sm text-muted-foreground">
                    Loading...
                </p>
            </div>
        );
    }

    if (!isAuthenticated) {
        return null;
    }

    const requiredPermission =
        routePermissions[
            pathname
        ];

    if (
        requiredPermission &&
        !hasPermission(
            requiredPermission,
        )
    ) {
        return null;
    }

    return <>{children}</>;
}