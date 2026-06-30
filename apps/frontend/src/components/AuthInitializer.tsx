"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "../stores/authStore";
import { api } from "../lib/api";
import { getSessionCookie } from "../lib/cookies";

export function AuthInitializer({ children }: { children: React.ReactNode }) {
  const [isReady, setIsReady] = useState(false);
  const logout = useAuthStore((s) => s.logout);
  const router = useRouter();

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
      } catch (err: any) {
        if (!cancelled) {
          if (err?.status === 401) {
            logout();
            router.replace("/auth");
          } else {
            useAuthStore.setState({
              accessToken: token,
              isAuthenticated: true,
            });
          }
        }
      } finally {
        if (!cancelled) setIsReady(true);
      }
    }

    validate();

    return () => {
      cancelled = true;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (!isReady) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-muted border-t-primary" />
          <p className="text-sm text-muted-foreground font-medium">
            Verificando credenciales...
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
