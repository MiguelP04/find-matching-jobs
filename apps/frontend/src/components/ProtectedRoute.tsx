"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "../hooks/useAuth";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Si terminó de cargar y no está autenticado, va para el login
    if (!isLoading && !isAuthenticated) {
      router.push("/auth");
    }
  }, [isAuthenticated, isLoading, router]);

  // Pantalla de carga mientras verifica token o estado de hidratación
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-2">
          {/* Un spinner simple con Tailwind v4 */}
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600" />
          <p className="text-sm text-gray-500 font-medium">
            Verificando credenciales...
          </p>
        </div>
      </div>
    );
  }

  // Si no está autenticado, bloqueamos el renderizado mientras actúa el router.push
  if (!isAuthenticated) return null;

  return <>{children}</>;
}
