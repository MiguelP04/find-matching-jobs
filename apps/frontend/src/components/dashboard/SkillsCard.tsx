"use client";

import { StudentSkill } from "@/hooks/useDashboard";
import SkeletonCard from "./SkeletonCard";
import Link from "next/link";
import { Target } from "lucide-react";

export default function SkillsCard({
  skills,
  loading,
  error,
}: {
  skills: StudentSkill[];
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

  const visible = skills.slice(0, 3);

  return (
    <div className="rounded-xl border bg-card p-5">
      <h2 className="mb-3 text-sm font-semibold text-foreground flex items-center gap-1.5"><Target className="size-4" /> Mis Skills</h2>

      {visible.length === 0 ? (
        <p className="text-xs text-muted-foreground">
          Aún no tienes skills registradas.
        </p>
      ) : (
        <ul className="mb-3 space-y-1.5">
          {visible.map((s) => (
            <li key={s.id} className="flex items-center justify-between text-xs">
              <span className="text-foreground">{s.skill.nombre}</span>
              <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                {s.nivel}
              </span>
            </li>
          ))}
        </ul>
      )}

      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">Total: {skills.length} skills</span>
        <Link href="/perfil" className="font-medium text-primary hover:underline">
          Gestionar Skills →
        </Link>
      </div>
    </div>
  );
}