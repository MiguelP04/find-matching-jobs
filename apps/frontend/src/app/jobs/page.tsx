"use client";

import { Suspense } from "react";
import { Briefcase } from "lucide-react";
import { JobFilterBar } from "../../components/jobs/JobFilterBar";
import { JobList } from "../../components/jobs/JobList";
import DashboardLayout from "../../components/dashboard/DashboardLayout";

export default function JobsPage() {
  return (
    <DashboardLayout>
      <div className="container mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Briefcase className="size-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Vacantes</h1>
            <p className="text-xs text-muted-foreground">Explora las oportunidades disponibles</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Suspense fallback={<div>Cargando filtros...</div>}>
            <div className="md:col-span-1">
              <JobFilterBar />
            </div>
          </Suspense>
          <Suspense fallback={<div>Cargando vacantes...</div>}>
            <div className="md:col-span-3">
              <JobList />
            </div>
          </Suspense>
        </div>
      </div>
    </DashboardLayout>
  );
}
