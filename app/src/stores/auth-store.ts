import { create } from 'zustand';
import * as authApi from '@/lib/auth';
import { ApiError } from '@/lib/api';
import type { RegisterData, User } from '@/types/user';

type AuthState = {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  fetchUser: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
  reset: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: false,
  error: null,

  fetchUser: async () => {
    set({ isLoading: true, error: null });
    try {
      const { user } = await authApi.getMe();
      set({ user, isLoading: false });
    } catch (err) {
      set({ user: null, isLoading: false });
      if (err instanceof ApiError && err.status !== 401) {
        set({ error: err.message });
      }
    }
  },

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const { user } = await authApi.login(email, password);
      set({ user, isLoading: false });
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Login failed';
      set({ isLoading: false, error: message });
      throw err;
    }
  },

  register: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const { user } = await authApi.register(data);
      set({ user, isLoading: false });
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : 'Registration failed';
      set({ isLoading: false, error: message });
      throw err;
    }
  },

  logout: async () => {
    set({ isLoading: true, error: null });
    try {
      await authApi.logout();
    } finally {
      set({ user: null, isLoading: false });
    }
  },

  clearError: () => set({ error: null }),

  reset: () => set({ user: null, isLoading: false, error: null }),
}));
