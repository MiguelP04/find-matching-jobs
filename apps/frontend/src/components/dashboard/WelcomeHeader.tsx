"use client";

import { useAuthStore } from "@/stores/authStore";

export default function WelcomeHeader() {
  const user = useAuthStore((s) => s.user);

  return (
    <div className="mb-6">
      <h1 className="text-2xl font-bold text-gray-900">
        ¡Bienvenido de vuelta, {user?.nombre} {user?.apellido}!
      </h1>
      <p className="text-sm text-gray-500 capitalize">
        {user?.rol} · {user?.email}
      </p>
    </div>
  );
}