import { create } from "zustand";
import { persist } from "zustand/middleware";
import { AuthResponseDto, RegisterDto } from "@find-matching-jobs/types";
import { api } from "../lib/api";

interface AuthState {
  user: AuthResponseDto["user"] | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterDto) => Promise<void>; // Ajustado al DTO compartido
  setAuth: (auth: AuthResponseDto) => void;
  logout: () => void;
  clearError: () => void;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          const res = await api.post<AuthResponseDto>("/auth/login", {
            email,
            password,
          });
          set({
            user: res.user,
            accessToken: res.access_token,
            isAuthenticated: true,
          });
        } catch (e) {
          set({ error: (e as Error).message });
        } finally {
          set({ isLoading: false });
        }
      },

      register: async (userData) => {
        set({ isLoading: true, error: null });
        try {
          // Enviamos el objeto de datos estructurado directamente al backend
          await api.post("/auth/register", userData);
        } catch (e) {
          set({ error: (e as Error).message });
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

      clearError: () => set({ error: null }),

      checkAuth: async () => {
        const { accessToken } = get();

        // Si no hay token en el localStorage, detenemos la carga silenciosamente
        if (!accessToken) {
          set({ isAuthenticated: false, user: null });
          return;
        }

        set({ isLoading: true });
        try {
          // Cambiado: Ahora apunta al endpoint real del backend para validar sesión
          const profileData = await api.get<any>("/profiles/me", accessToken);

          // Guardamos la sesión activa.
          // Nota: Si tu store espera la estructura exacta de 'user', puedes guardar profileData
          // o extender tu tipado según lo que devuelva este endpoint.
          set({ user: profileData, isAuthenticated: true });
        } catch (e) {
          // Si el token expiró (Error 401) o es inválido, limpiamos la sesión
          set({ user: null, accessToken: null, isAuthenticated: false });
        } finally {
          set({ isLoading: false });
        }
      },
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
