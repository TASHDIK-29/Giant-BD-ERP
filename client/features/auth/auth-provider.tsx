'use client';

import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react';

import {
  usePathname,
  useRouter,
} from 'next/navigation';

import {
  getSession,
  refreshToken,
} from './api';

import type {
  SessionResponse,
} from './types';

import {
  hasPermission as checkPermission,
  hasAnyPermission as checkAnyPermission,
  hasAllPermissions as checkAllPermissions,
} from '@/lib/permissions';

interface AuthContextValue {
  session: SessionResponse | null;

  isAuthenticated: boolean;

  isLoading: boolean;

  hasPermission: (
    permission: string,
  ) => boolean;

  hasAnyPermission: (
    permissions: string[],
  ) => boolean;

  hasAllPermissions: (
    permissions: string[],
  ) => boolean;
}

const AuthContext =
  createContext<
    AuthContextValue | undefined
  >(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({
  children,
}: AuthProviderProps) {
  const router = useRouter();
  const pathname = usePathname();

  const [session, setSession] =
    useState<SessionResponse | null>(
      null,
    );

  const [isLoading, setIsLoading] =
    useState(true);

  useEffect(() => {
    let mounted = true;

    const checkSession = async () => {
      try {
        const currentSession =
          await getSession();

        if (mounted) {
          setSession(
            currentSession,
          );
        }
      } catch {
        try {
          await refreshToken();

          const refreshedSession =
            await getSession();

          if (mounted) {
            setSession(
              refreshedSession,
            );
          }
        } catch {
          if (mounted) {
            setSession(null);
          }

          if (
            pathname !==
            '/login'
          ) {
            router.replace(
              '/login',
            );
          }
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    checkSession();

    return () => {
      mounted = false;
    };
  }, [pathname, router]);

  const permissions =
    session?.permissions ?? [];

  const hasPermission = (
    permission: string,
  ) =>
    checkPermission(
      permissions,
      permission,
    );

  const hasAnyPermission = (
    requiredPermissions: string[],
  ) =>
    checkAnyPermission(
      permissions,
      requiredPermissions,
    );

  const hasAllPermissions = (
    requiredPermissions: string[],
  ) =>
    checkAllPermissions(
      permissions,
      requiredPermissions,
    );

  return (
    <AuthContext.Provider
      value={{
        session,

        isAuthenticated:
          !!session,

        isLoading,

        hasPermission,

        hasAnyPermission,

        hasAllPermissions,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context =
    useContext(AuthContext);

  if (!context) {
    throw new Error(
      'useAuth must be used inside AuthProvider',
    );
  }

  return context;
}