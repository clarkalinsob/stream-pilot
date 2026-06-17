import { create } from 'zustand';
import * as authApi from '@/lib/auth';
import { ApiError } from '@/lib/api';
import type { RegisterData, User } from '@/types/user';

type FetchUserOptions = {
  silent?: boolean;
};

type AuthState = {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  fetchUser: (options?: FetchUserOptions) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  handleSessionExpired: () => Promise<void>;
  clearError: () => void;
  reset: () => void;
};

let fetchUserRequestId = 0;

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  error: null,

  fetchUser: async ({ silent = false } = {}) => {
    const requestId = ++fetchUserRequestId;

    if (!silent) {
      set({ isLoading: true, error: null });
    }

    try {
      const { user } = await authApi.getMe();
      if (requestId !== fetchUserRequestId) return;
      set({ user, isLoading: false });
    } catch (err) {
      if (requestId !== fetchUserRequestId) return;

      if (err instanceof ApiError && err.status === 401) {
        // Keep optimistic user after login if the session cookie hasn't propagated yet.
        if (silent && useAuthStore.getState().user) {
          set({ isLoading: false });
          return;
        }
        await useAuthStore.getState().handleSessionExpired();
        return;
      }

      set({ user: null, isLoading: false });
      if (err instanceof ApiError) {
        set({ error: err.message });
      }
    }
  },

  login: async (email, password) => {
    fetchUserRequestId += 1;
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
    fetchUserRequestId += 1;
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
    fetchUserRequestId += 1;
    set({ isLoading: true, error: null });
    try {
      await authApi.logout();
    } finally {
      set({ user: null, isLoading: false });
    }
  },

  handleSessionExpired: async () => {
    fetchUserRequestId += 1;
    set({ user: null, isLoading: false, error: null });
    try {
      await authApi.logout();
    } catch {
      // Cookie may already be missing or invalid.
    }
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  },

  clearError: () => set({ error: null }),

  reset: () => {
    fetchUserRequestId += 1;
    set({ user: null, isLoading: false, error: null });
  },
}));
