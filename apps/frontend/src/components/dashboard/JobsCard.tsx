"use client";

import SkeletonCard from "./SkeletonCard";
import Link from "next/link";

function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "Hoy";
  if (days === 1) return "Ayer";
  return `Hace ${days} días`;
}

interface Job {
  id: number;
  titulo: string;
  empresa: string;
  ubicacion: string;
  fecha_publicacion: string;
}

export default function JobsCard({
  jobs,
  loading,
  error,
}: {
  jobs: Job[];
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

  return (
    <div className="rounded-xl border bg-white p-5">
      <h2 className="mb-3 text-sm font-semibold text-gray-700">🔍 Vacantes Recientes</h2>

      {jobs.length === 0 ? (
        <p className="text-xs text-gray-400">
          No hay vacantes disponibles aún
        </p>
      ) : (
        <ul className="mb-3 space-y-3">
          {jobs.map((job) => (
            <li key={job.id} className="flex items-center justify-between border-b pb-2 last:border-0">
              <div>
                <p className="text-sm font-medium text-gray-800">{job.titulo}</p>
                <p className="text-xs text-gray-500">
                  {job.empresa} • {job.ubicacion}
                </p>
              </div>
              <span className="shrink-0 text-[10px] text-gray-400">
                {timeAgo(job.fecha_publicacion)}
              </span>
            </li>
          ))}
        </ul>
      )}

      <Link
        href="/jobs"
        className="text-xs font-medium text-primary hover:underline"
      >
        Ver todas las vacantes →
      </Link>
    </div>
  );
}
