'use client';

import {
  useMutation,
  useQuery,
} from '@tanstack/react-query';

import {
  getSession,
  login,
  logout,
  refreshToken,
  verifyOtp,
} from './api';

export function useLogin() {
  return useMutation({
    mutationFn: login,
  });
}

export function useVerifyOtp() {
  return useMutation({
    mutationFn: verifyOtp,
  });
}

export function useSession() {
  return useQuery({
    queryKey: ['auth', 'session'],
    queryFn: getSession,
    retry: false,
  });
}

export function useRefreshToken() {
  return useMutation({
    mutationFn: refreshToken,
  });
}

export function useLogout() {
  return useMutation({
    mutationFn: logout,
  });
}