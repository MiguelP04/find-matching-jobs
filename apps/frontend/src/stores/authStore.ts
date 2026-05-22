import { create } from "zustand";
import { persist } from "zustand/middleware";
import { AuthResponseDto } from "@find-matching-jobs/types";
import { api } from "../lib/api";

interface AuthState {
  user: AuthResponseDto["user"] | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (nombre: string, apellido: string, email: string, password: string) => Promise<void>;
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
      isLoading: false,
      error: null,

      login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          const res = await api.post<AuthResponseDto>("/auth/login", { email, password });
          set({ user: res.user, accessToken: res.access_token, isAuthenticated: true });
        } catch (e) {
          set({
            error: (e as Error).message
          });
        } finally {
          set({ isLoading: false });
        }
      },

      register: async (nombre, apellido, email, password) => {
        set({ isLoading: true, error: null });
        try {
          await api.post("/auth/register", { nombre, apellido, email, password });
        } catch (e) {
          set({
            error: (e as Error).message
          });
        } finally {
          set({ isLoading: false });
        }
      },

      setAuth: (auth) =>
        set({
          user: auth.user,
          accessToken: auth.access_token,
          isAuthenticated: true,
        }),

      logout: () =>
        set({
          user: null,
          accessToken: null,
          isAuthenticated: false,
        }),

      clearError: () => set({
        error: null,
      }),
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
