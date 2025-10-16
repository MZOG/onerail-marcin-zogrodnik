import { create } from "zustand";
import { persist } from "zustand/middleware";
import { loginUser, refreshToken } from "../lib/api";
import type { PersistOptions } from "zustand/middleware";

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refresh: () => Promise<void>;
}

interface LoginResponse {
  access_token: string;
  refresh_token: string;
}

interface RefreshResponse {
  access_token: string;
}

// ✅ Explicitly define both generic types for PersistOptions
type AuthPersist = PersistOptions<AuthState, Partial<AuthState>>;

export const useAuthStore = create<AuthState>()(
  persist<AuthState>(
    (set, get) => ({
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,

      login: async (email, password) => {
        const data: LoginResponse = await loginUser(email, password);
        set({
          accessToken: data.access_token,
          refreshToken: data.refresh_token,
          isAuthenticated: true,
        });
      },

      logout: () => {
        set({
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
        });
      },

      refresh: async () => {
        const token = get().refreshToken;
        if (!token) {
          get().logout();
          return;
        }

        try {
          const data: RefreshResponse = await refreshToken(token);
          set({
            accessToken: data.access_token,
            isAuthenticated: true,
          });
        } catch {
          get().logout();
        }
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) =>
        ({
          accessToken: state.accessToken,
          refreshToken: state.refreshToken,
          isAuthenticated: state.isAuthenticated,
        } as AuthState),
    } satisfies AuthPersist
  )
);
