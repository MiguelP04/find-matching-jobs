'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { getMatches, refreshMatches, GetMatchesParams } from '../../services/jobService';
import { MatchResult } from '../../types/job';
import { ApiError } from '../../lib/api';
import { JobCard } from './JobCard';
import { Button } from '../ui/button';
import Link from 'next/link';

const PAGE_SIZE = 10;

export const JobList = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [matches, setMatches] = useState<MatchResult[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [noProfile, setNoProfile] = useState(false);

  const page = parseInt(searchParams.get('page') || '1');

  const fetchMatches = useCallback(async () => {
    setLoading(true);
    setError(null);
    setNoProfile(false);
    try {
      const params: GetMatchesParams = {
        minScore: searchParams.get('minScore') ? parseInt(searchParams.get('minScore')!) : undefined,
        page,
        limit: PAGE_SIZE,
      };
      const result = await getMatches(params);
      setMatches(result.data);
      setTotal(result.total);
    } catch (e) {
      if (e instanceof ApiError && e.status === 404) {
        setNoProfile(true);
      } else {
        setError((e as Error).message);
      }
    } finally {
      setLoading(false);
    }
  }, [searchParams, page]);

  useEffect(() => {
    fetchMatches();
  }, [fetchMatches]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshMatches();
      await fetchMatches();
    } catch (e) {
      if (e instanceof ApiError && e.status === 404) {
        setNoProfile(true);
      } else {
        setError((e as Error).message);
      }
    } finally {
      setRefreshing(false);
    }
  };

  const totalPages = Math.ceil(total / PAGE_SIZE) || 1;

  if (noProfile) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
        <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md mx-4 text-center">
          <div className="text-5xl mb-4">👤</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">
            Perfil no encontrado
          </h2>
          <p className="text-gray-600 mb-6">
            Necesitas crear un perfil antes de poder ver las vacantes disponibles.
            Agrega tus datos, skills y preferencias para obtener matches personalizados.
          </p>
          <div className="flex gap-3 justify-center">
            <Button onClick={() => router.push('/perfil')}>
              Ir a mi perfil
            </Button>
            <Button variant="outline" onClick={fetchMatches}>
              Reintentar
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center gap-4 p-8">
        <p className="text-red-600">Error: {error}</p>
        <Button onClick={fetchMatches}>Reintentar</Button>
      </div>
    );
  }

  if (loading && matches.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4">
        <div className="animate-pulse space-y-4 w-full">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-gray-100 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <Button onClick={handleRefresh} disabled={refreshing}>
          {refreshing ? 'Actualizando...' : 'Actualizar matches'}
        </Button>
      </div>

      {matches.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">No se encontraron matches.</p>
          <p className="text-sm text-gray-400 mt-1">
            Crea un perfil y agrega tus skills para obtener recomendaciones.
          </p>
        </div>
      ) : (
        matches.map((match) => <JobCard key={match.id} match={match} />)
      )}

      {totalPages > 1 && (
        <div className="flex justify-between items-center mt-4">
          <Button
            disabled={page <= 1}
            onClick={() => {
              const params = new URLSearchParams(searchParams);
              params.set('page', (page - 1).toString());
              router.push(`/jobs?${params.toString()}`);
            }}
          >
            Anterior
          </Button>
          <span className="text-sm text-gray-500">
            Página {page} de {totalPages}
          </span>
          <Button
            disabled={page >= totalPages}
            onClick={() => {
              const params = new URLSearchParams(searchParams);
              params.set('page', (page + 1).toString());
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
