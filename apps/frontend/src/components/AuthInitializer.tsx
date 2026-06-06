"use client";

import { useEffect } from "react";
import { useAuthStore } from "../stores/authStore";

export function AuthInitializer({ children }: { children: React.ReactNode }) {
  const checkAuth = useAuthStore((state) => state.checkAuth);

  useEffect(() => {
    // Se ejecuta una sola vez al cargar o refrescar la aplicación entera
    checkAuth();
  }, [checkAuth]);

  return <>{children}</>;
}
