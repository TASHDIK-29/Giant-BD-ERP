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

import {
    getDefaultRoute,
} from '@/lib/default-route';

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
            routePermissions[pathname];

        if (!requiredPermission) {
            return;
        }

        if (
            hasPermission(
                requiredPermission,
            )
        ) {
            return;
        }

        const defaultRoute =
            getDefaultRoute(
                session?.permissions ?? [],
            );

        /*
         * User has another accessible page.
         */
        if (defaultRoute) {
            router.replace(
                defaultRoute,
            );

            return;
        }

        /*
         * User has no accessible page.
         *
         * Don't redirect to /dashboard because
         * they don't have dashboard:read.
         */
        router.replace('/login');
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
        routePermissions[pathname];

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