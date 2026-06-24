"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useAuthStore } from "../stores/authStore";
import { api } from "../lib/api";
import { getSessionCookie } from "../lib/cookies";

interface AuthContextValue {
  isReady: boolean;
}

const AuthContext = createContext<AuthContextValue>({ isReady: false });

export function useAuthContext() {
  return useContext(AuthContext);
}

export function AuthInitializer({ children }: { children: React.ReactNode }) {
  const [isReady, setIsReady] = useState(false);
  const logout = useAuthStore((s) => s.logout);

  useEffect(() => {
    let cancelled = false;

    async function validate() {
      const token = getSessionCookie();

      if (!token) {
        logout();
        if (!cancelled) setIsReady(true);
        return;
      }

      try {
        const profileData = await api.get<any>("/profiles/me", token);
        if (cancelled) return;
        useAuthStore.setState({
          user: profileData.user,
          accessToken: token,
          isAuthenticated: true,
        });
      } catch {
        if (!cancelled) logout();
      } finally {
        if (!cancelled) setIsReady(true);
      }
    }

    validate();

    return () => {
      cancelled = true;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <AuthContext.Provider value={{ isReady }}>{children}</AuthContext.Provider>
  );
}
