"use client";

import ProtectedRoute from "@/components/ProtectedRoute";

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <main className="p-6">
        <h1>Este es contenido privado del Dashboard</h1>
      </main>
    </ProtectedRoute>
  );
}
