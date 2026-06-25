'use client';

import { Suspense } from 'react';
import { MatchFilterBar } from '../../components/matches/MatchFilterBar';
import { MatchList } from '../../components/matches/MatchList';
import ProtectedRoute from '../../components/ProtectedRoute';
import DashboardLayout from '../../components/dashboard/DashboardLayout';

export default function MatchesPage() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="container mx-auto">
          <h1 className="text-2xl font-bold mb-4">Mis Matches</h1>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Suspense fallback={<div>Cargando filtros...</div>}>
              <div className="md:col-span-1">
                <MatchFilterBar />
              </div>
            </Suspense>
            <Suspense fallback={<div>Cargando matches...</div>}>
              <div className="md:col-span-3">
                <MatchList />
              </div>
            </Suspense>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
