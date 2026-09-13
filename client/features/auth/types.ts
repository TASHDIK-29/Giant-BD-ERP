export interface AuthUser {
  id: number;
  email: string;
  name: string;
  role: string;
  roleId: number;
}

export interface SessionResponse {
  user: AuthUser;
  permissions: string[];
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface VerifyOtpRequest {
  email: string;
  otp: string;
}

export interface AuthMessageResponse {
  message: string;
}