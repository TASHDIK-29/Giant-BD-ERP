'use client';

import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react';

import { usePathname, useRouter } from 'next/navigation';

import { getSession, refreshToken } from './api';
import type { SessionResponse } from './types';

interface AuthContextValue {
  session: SessionResponse | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(
  undefined,
);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({
  children,
}: AuthProviderProps) {
  const router = useRouter();
  const pathname = usePathname();

  const [session, setSession] =
    useState<SessionResponse | null>(null);

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const checkSession = async () => {
      try {
        // First try the existing access token.
        const currentSession = await getSession();

        if (mounted) {
          setSession(currentSession);
        }
      } catch {
        try {
          // Access token may have expired.
          // Try refreshing it using the refresh-token cookie.
          await refreshToken();

          const refreshedSession = await getSession();

          if (mounted) {
            setSession(refreshedSession);
          }
        } catch {
          if (mounted) {
            setSession(null);
          }

          // Do not redirect if already on the login page.
          if (pathname !== '/login') {
            router.replace('/login');
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

  return (
    <AuthContext.Provider
      value={{
        session,
        isAuthenticated: !!session,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      'useAuth must be used inside AuthProvider',
    );
  }

  return context;
}