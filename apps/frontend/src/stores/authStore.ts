import { create } from "zustand";
import { persist } from "zustand/middleware";
import { AuthResponseDto, RegisterDto } from "@find-matching-jobs/types";
import { api } from "../lib/api";
import { setSessionCookie, clearSessionCookie } from "../lib/cookies";

interface AuthState {
  user: AuthResponseDto["user"] | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterDto) => Promise<void>;
  setAuth: (auth: AuthResponseDto) => void;
  logout: () => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      error: null,

      login: async (email, password) => {
        set({ error: null });
        try {
          const res = await api.post<AuthResponseDto>("/auth/login", {
            email,
            password,
          });
          setSessionCookie(res.access_token);
          set({
            user: res.user,
            accessToken: res.access_token,
            isAuthenticated: true,
          });
        } catch (e) {
          set({ error: (e as Error).message });
          throw e;
        }
      },

      register: async (userData) => {
        set({ error: null });
        try {
          await api.post("/auth/register", userData);
        } catch (e) {
          set({ error: (e as Error).message });
          throw e;
        }
      },

      setAuth: (auth) => {
        setSessionCookie(auth.access_token);
        set({
          user: auth.user,
          accessToken: auth.access_token,
          isAuthenticated: true,
        });
      },

      logout: () => {
        clearSessionCookie();
        set({
          user: null,
          accessToken: null,
          isAuthenticated: false,
        });
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);
