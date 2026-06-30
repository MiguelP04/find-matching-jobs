"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { JobDetail } from "@/components/jobs/JobDetail";
import { JobDetailSkeleton } from "@/components/jobs/JobDetailSkeleton";
import { getJobById } from "@/services/jobService";
import type { JobDetailResponse } from "@/types/job";

export default function JobDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [data, setData] = useState<JobDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const numericId = Number(id);
    if (isNaN(numericId)) {
      setError("ID de vacante inválido");
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    getJobById(numericId)
      .then((res) => {
        if (!cancelled) setData(res);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || "Error al cargar la vacante");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  return (
    <DashboardLayout>
      <div className="container mx-auto">
        {loading && <JobDetailSkeleton />}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
            <p>{error}</p>
            <button
              onClick={() => router.push("/jobs")}
              className="mt-3 text-sm font-medium text-red-800 hover:text-red-900 underline"
            >
              ← Volver a vacantes
            </button>
          </div>
        )}
        {data && <JobDetail job={data} />}
      </div>
    </DashboardLayout>
  );
}
