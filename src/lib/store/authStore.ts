import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '@/lib/types';
import { authService } from '@/lib/api/auth.service';
import apiClient from '@/lib/api/client';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  setUser: (user: User | null) => void;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  loadUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,

      setUser: (user) => {
        set({ user, isAuthenticated: !!user });
      },

      login: async (email: string, password: string) => {
        set({ isLoading: true });
        try {
          useAuthStore.persist.clearStorage();
          const response = await authService.login({ email, password });
          if (response.user) {
            set({ user: response.user, isAuthenticated: true });
          }
        } finally {
          set({ isLoading: false });
        }
      },

      logout: async () => {
        set({ isLoading: true });
        try {
          await authService.logout();
          set({ user: null, isAuthenticated: false });
          useAuthStore.persist.clearStorage();
        } finally {
          set({ isLoading: false });
        }
      },

      updateProfile: async (data: Partial<User>) => {
        set({ isLoading: true });
        try {
          const response = await authService.updateProfile(data);
          if (response.user) {
            set({ user: response.user });
          }
        } finally {
          set({ isLoading: false });
        }
      },

      loadUser: async () => {
        if (!apiClient.isAuthenticated()) {
          set({ user: null, isAuthenticated: false });
          return;
        }

        set({ isLoading: true });
        try {
          const response = await authService.getProfile();
          if (response.user) {
            set({ user: response.user, isAuthenticated: true });
          }
        } catch {
          set({ user: null, isAuthenticated: false });
          apiClient.clearTokens();
        } finally {
          set({ isLoading: false });
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
