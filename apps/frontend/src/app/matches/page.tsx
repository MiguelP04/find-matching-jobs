"use client";

import { Suspense } from "react";
import { Target } from "lucide-react";
import { MatchFilterBar } from "../../components/matches/MatchFilterBar";
import { MatchList } from "../../components/matches/MatchList";
import DashboardLayout from "../../components/dashboard/DashboardLayout";

export default function MatchesPage() {
  return (
    <DashboardLayout>
      <div className="container mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Target className="size-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Recomendaciones</h1>
            <p className="text-xs text-muted-foreground">Vacantes recomendadas para ti</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Suspense fallback={<div>Cargando filtros...</div>}>
            <div className="md:col-span-1">
              <MatchFilterBar />
            </div>
          </Suspense>
          <Suspense fallback={<div>Cargando recomendaciones...</div>}>
            <div className="md:col-span-3">
              <MatchList />
            </div>
          </Suspense>
        </div>
      </div>
    </DashboardLayout>
  );
}
