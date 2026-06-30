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
  { key: "linkedin_url", label: "LinkedIn" },
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
      <div className="rounded-xl border bg-card p-5 text-sm text-destructive">
        {error}
      </div>
    );
  }

  const filled = fields.filter((f) => profile?.[f.key]).length;
  const total = fields.length;
  const pct = Math.round((filled / total) * 100);

  return (
    <div className="relative rounded-xl border border-secondary/20 bg-gradient-to-br from-secondary to-[#0f1f5a] p-6 shadow-lg overflow-hidden">
      <div className="absolute left-0 top-0 h-full w-[3px] bg-primary" />

      <CircleCheckBig className="absolute -bottom-4 -right-4 size-20 text-white/[0.06] pointer-events-none" />

      <div className="relative z-10">
        <h2 className="mb-3 text-2xl font-semibold text-white">Mi Perfil</h2>

        <p className="mb-2 text-xs text-blue-200">
          {filled} de {total} campos completados
        </p>
        <div className="mb-6">
          <div className="h-2 w-full overflow-hidden rounded-full bg-white/20">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>

        {filled < total && (
          <Link
            href="/perfil"
            className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-secondary transition-colors hover:bg-primary/80 w-full"
          >
            Completar perfil
          </Link>
        )}
      </div>
    </div>
  );
}