"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { getJobs } from "../../services/jobService";
import { Job } from "../../types/job";
import { JobCard } from "./JobCard";
import { JobCardSkeleton } from "./JobCardSkeleton";
import { Button } from "../ui/button";

const PAGE_SIZE = 10;

export const JobList = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const page = parseInt(searchParams.get("page") || "1");
  const ubicacion = searchParams.get("ubicacion") || undefined;
  const empresa = searchParams.get("empresa") || undefined;

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getJobs({
        ubicacion,
        empresa,
        page,
        limit: PAGE_SIZE,
      });
      setJobs(result.jobs);
      setTotal(result.total);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, [ubicacion, empresa, page]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const totalPages = Math.ceil(total / PAGE_SIZE) || 1;

  if (error) {
    return (
      <div className="flex flex-col items-center gap-4 p-8">
        <p className="text-red-600">Error: {error}</p>
        <Button onClick={fetchJobs}>Reintentar</Button>
      </div>
    );
  }

  if (loading && jobs.length === 0) {
    return <JobCardSkeleton count={3} />;
  }

  return (
    <div className="flex flex-col gap-3 relative">
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-sm font-medium text-foreground">Vacantes disponibles</h2>
        {!loading && <span className="text-xs text-muted-foreground">{total} resultados</span>}
      </div>
      {loading && jobs.length > 0 && (
        <div className="absolute inset-0 bg-background/60 flex items-center justify-center z-10 rounded-lg">
          <div className="size-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      )}
      {jobs.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-sm text-muted-foreground">No se encontraron vacantes.</p>
          <p className="text-xs text-muted-foreground mt-1">
            Intenta ajustar los filtros de búsqueda.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-0.5 bg-card border border-border rounded-xl shadow-sm">
          {jobs.map((job) => <JobCard key={job.id} job={job} />)}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-between items-center mt-4">
          <Button
            disabled={page <= 1}
            onClick={() => {
              const params = new URLSearchParams(searchParams);
              params.set("page", (page - 1).toString());
              router.push(`/jobs?${params.toString()}`);
            }}
          >
            Anterior
          </Button>
          <span className="text-xs text-muted-foreground">
            Página {page} de {totalPages}
          </span>
          <Button
            disabled={page >= totalPages}
            onClick={() => {
              const params = new URLSearchParams(searchParams);
              params.set("page", (page + 1).toString());
              router.push(`/jobs?${params.toString()}`);
            }}
          >
            Siguiente
          </Button>
        </div>
      )}
    </div>
  );
};
