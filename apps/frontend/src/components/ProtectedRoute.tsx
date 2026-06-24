"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { useAuth } from "../hooks/useAuth";
import { useAuthContext } from "./AuthInitializer";

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const { isReady } = useAuthContext();
  const router = useRouter();
  const timeoutRef = useRef(false);

  useEffect(() => {
    if (isReady && !isAuthenticated) {
      router.replace("/auth");
    }
  }, [isReady, isAuthenticated, router]);

  useEffect(() => {
    const id = setTimeout(() => {
      if (!isReady) {
        timeoutRef.current = true;
        router.replace("/auth");
      }
    }, 5000);
    return () => clearTimeout(id);
  }, [isReady, router]);

  if (!isReady && !timeoutRef.current) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600" />
          <p className="text-sm text-gray-500 font-medium">
            Verificando credenciales...
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return <>{children}</>;
}
