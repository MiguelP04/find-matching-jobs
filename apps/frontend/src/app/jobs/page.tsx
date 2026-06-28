"use client";

import { Suspense } from "react";
import { JobFilterBar } from "../../components/jobs/JobFilterBar";
import { JobList } from "../../components/jobs/JobList";
import DashboardLayout from "../../components/dashboard/DashboardLayout";

export default function JobsPage() {
  return (
    <DashboardLayout>
      <div className="container mx-auto">
        <h1 className="text-2xl font-bold mb-4">Vacantes</h1>
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
