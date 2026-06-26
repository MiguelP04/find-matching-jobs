"use client";

import { StudentSkill } from "@/hooks/useDashboard";
import SkeletonCard from "./SkeletonCard";
import Link from "next/link";

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
      <div className="rounded-xl border bg-white p-5 text-sm text-red-500">
        {error}
      </div>
    );
  }

  const visible = skills.slice(0, 3);

  return (
    <div className="rounded-xl border bg-white p-5">
      <h2 className="mb-3 text-sm font-semibold text-gray-700">🎯 Mis Skills</h2>

      {visible.length === 0 ? (
        <p className="text-xs text-gray-400">
          Aún no tienes skills registradas.
        </p>
      ) : (
        <ul className="mb-3 space-y-1.5">
          {visible.map((s) => (
            <li key={s.id} className="flex items-center justify-between text-xs">
              <span className="text-gray-700">{s.skill.nombre}</span>
              <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-500">
                {s.nivel}
              </span>
            </li>
          ))}
        </ul>
      )}

      <div className="flex items-center justify-between text-xs">
        <span className="text-gray-400">Total: {skills.length} skills</span>
        <Link href="/dashboard/skills" className="font-medium text-primary hover:underline">
          Gestionar Skills →
        </Link>
      </div>
    </div>
  );
}