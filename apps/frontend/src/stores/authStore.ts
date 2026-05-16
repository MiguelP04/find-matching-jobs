import { create } from "zustand";
import { AuthResponseDto, UserRole } from "@find-matching-jobs/types";

interface AuthState {
  user: AuthResponseDto["user"] | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  setAuth: (auth: AuthResponseDto) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,
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
}));
