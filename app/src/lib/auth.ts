import { apiFetch } from './api';
import type { AuthResponse, MeResponse, RegisterData } from '@/types/user';

export function register(data: RegisterData) {
  return apiFetch<AuthResponse>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function login(email: string, password: string) {
  return apiFetch<AuthResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export function logout() {
  return apiFetch<{ ok: boolean }>('/auth/logout', {
    method: 'POST',
  });
}

export function getMe() {
  return apiFetch<MeResponse>('/auth/me');
}
