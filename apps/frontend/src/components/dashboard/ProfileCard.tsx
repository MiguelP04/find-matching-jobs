"use client";

import { Profile } from "@/hooks/useDashboard";
import SkeletonCard from "./SkeletonCard";
import { CircleCheckBig } from "lucide-react";
import Link from "next/link";

const fields: { key: keyof Profile; label: string }[] = [
  { key: "resumen_profesional", label: "Resumen profesional" },
  { key: "semestre", label: "Semestre" },
  { key: "modalidad_preferida", label: "Modalidad preferida" },
  { key: "github_url", label: "GitHub" },
  { key: "linkendin_url", label: "LinkedIn" },
];

export default function ProfileCard({
  profile,
  loading,
  error,
}: {
  profile: Profile | null;
  loading: boolean;
  error?: string;
}) {
  if (loading) return <SkeletonCard />;

  if (error) {
    return (
      <div className="rounded-xl border bg-white p-5 text-sm text-red-500">
        {error}
      </div>
    );
  }

  const filled = fields.filter((f) => profile?.[f.key]).length;
  const total = fields.length;
  const pct = Math.round((filled / total) * 100);

  return (
    <div className="rounded-xl border bg-blue-950 p-6 pb-16 w-64 relative overflow-hidden">
      <CircleCheckBig className="absolute -bottom-4 -right-4 size-28 text-white/10 pointer-events-none" />

      <div className="relative z-10">
        <h2 className="mb-3 text-2xl font-semibold text-white">Mi Perfil</h2>

      <p className="mb-2 text-xs text-gray-500">
        {filled} de {total} campos completados
      </p>
      <div className="mb-6">
        <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
          <div
            className="h-full rounded-full bg-primary transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {filled < total && (
        <Link
          href="/perfil"
          className="inline-block rounded-lg bg-primary px-4 py-4 text-sm font-semibold text-secondary text-center block w-full transition-colors hover:bg-primary/80"
        >
          Completar perfil
        </Link>
      )}
      </div>
    </div>
  );
}