import { api } from '@/lib/axios';

import type {
  AuthMessageResponse,
  LoginRequest,
  SessionResponse,
  VerifyOtpRequest,
} from './types';

export async function login(
  data: LoginRequest,
): Promise<AuthMessageResponse> {
  const response = await api.post<AuthMessageResponse>(
    '/auth/login',
    data,
  );

  return response.data;
}

export async function verifyOtp(
  data: VerifyOtpRequest,
): Promise<AuthMessageResponse> {
  const response = await api.post<AuthMessageResponse>(
    '/auth/verify-otp',
    data,
  );

  return response.data;
}

export async function getSession(): Promise<SessionResponse> {
  const response = await api.get<SessionResponse>(
    '/auth/session',
  );

  return response.data;
}

export async function refreshToken(): Promise<AuthMessageResponse> {
  const response = await api.post<AuthMessageResponse>(
    '/auth/refresh',
  );

  return response.data;
}

export async function logout(): Promise<AuthMessageResponse> {
  const response = await api.post<AuthMessageResponse>(
    '/auth/logout',
  );

  return response.data;
}