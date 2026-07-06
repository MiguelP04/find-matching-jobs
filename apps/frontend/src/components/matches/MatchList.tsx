'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { getMatches } from '../../services/matchService';
import { MatchResult } from '../../types/job';
import { ApiError } from '../../lib/api';
import { MatchCard } from './MatchCard';
import { MatchCardSkeleton } from './MatchCardSkeleton';
import { UserRoundX, Clock } from 'lucide-react';
import { Button } from '../ui/button';

const PAGE_SIZE = 10;

function MatchStatsBar({ matches, total }: { matches: MatchResult[]; total: number }) {
  if (matches.length === 0) return null;
  const avgScore = Math.round(matches.reduce((sum, m) => sum + m.score, 0) / matches.length);
  const bestScore = Math.max(...matches.map((m) => m.score));

  return (
    <div className="flex items-center gap-4 px-4 py-3 rounded-xl bg-card border border-border shadow-sm">
      <div className="flex items-center gap-2 text-sm">
        <span className="text-muted-foreground">Total</span>
        <span className="font-semibold text-foreground">{total}</span>
      </div>
      <div className="w-px h-6 bg-border" />
      <div className="flex items-center gap-2 text-sm">
        <span className="text-muted-foreground">Puntaje promedio</span>
        <span className="font-semibold text-foreground">{avgScore}</span>
      </div>
      <div className="w-px h-6 bg-border" />
      <div className="flex items-center gap-2 text-sm">
        <span className="text-muted-foreground">Mejor coincidencia</span>
        <span className="font-semibold text-green-600">{bestScore}</span>
      </div>
    </div>
  );
}

function formatTimeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'hace unos segundos';
  if (mins < 60) return `hace ${mins} min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `hace ${hours}h`;
  return `hace ${Math.floor(hours / 24)}d`;
}

export const MatchList = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [matches, setMatches] = useState<MatchResult[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [noProfile, setNoProfile] = useState(false);

  const page = parseInt(searchParams.get('page') || '1');

  const fetchMatches = useCallback(async () => {
    setLoading(true);
    setError(null);
    setNoProfile(false);
    try {
      const params = {
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

  const lastUpdated = matches.length > 0
    ? matches.reduce((latest, m) =>
        new Date(m.fecha_analisis) > new Date(latest) ? m.fecha_analisis : latest,
      matches[0].fecha_analisis)
    : null;

  const totalPages = Math.ceil(total / PAGE_SIZE) || 1;

  if (noProfile) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
        <div className="bg-card rounded-xl shadow-2xl p-8 max-w-md mx-4 text-center">
          <UserRoundX className="size-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-bold text-foreground mb-2">
            Perfil no encontrado
          </h2>
          <p className="text-muted-foreground mb-6">
            Necesitas crear un perfil antes de poder ver las vacantes disponibles.
            Agrega tus datos, skills y preferencias para obtener recomendaciones personalizadas.
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
    return <MatchCardSkeleton count={3} />;
  }

  return (
    <div className="flex flex-col gap-3 relative">
      {loading && matches.length > 0 && (
        <div className="absolute inset-0 bg-background/60 flex items-center justify-center z-10 rounded-lg">
          <div className="size-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      )}
      <MatchStatsBar matches={matches} total={total} />

      {lastUpdated && (
        <div className="flex items-center justify-end gap-1.5 text-xs text-muted-foreground">
          <Clock className="size-3.5" />
          <span>Última actualización: {formatTimeAgo(lastUpdated)}</span>
        </div>
      )}

      {matches.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-sm text-muted-foreground">No se encontraron recomendaciones.</p>
          <p className="text-xs text-muted-foreground mt-1">
            Crea un perfil y agrega tus skills para obtener recomendaciones.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {matches.map((match) => <MatchCard key={match.id} match={match} />)}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-between items-center mt-4">
          <Button
            disabled={page <= 1}
            onClick={() => {
              const params = new URLSearchParams(searchParams);
              params.set('page', (page - 1).toString());
              router.push(`/matches?${params.toString()}`);
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
              params.set('page', (page + 1).toString());
              router.push(`/matches?${params.toString()}`);
            }}
          >
            Siguiente
          </Button>
        </div>
      )}
    </div>
  );
};
