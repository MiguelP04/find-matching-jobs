import { useAuthStore } from "../stores/authStore";
import { useEffect, useState } from "react";

export function useAuth() {
  const store = useAuthStore();
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    // Una vez montado en el cliente, confirmamos la hidratación del localStorage
    setIsHydrated(true);
  }, []);

  return {
    ...store,
    // Si no se ha hidratado, forzamos false/true temporalmente para el SSR
    isAuthenticated: isHydrated ? store.isAuthenticated : false,
    isLoading: store.isLoading || !isHydrated,
    isHydrated,
  };
}
