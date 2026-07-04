'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '../ui/button';
import { Filter } from 'lucide-react';

const SCORE_OPTIONS = [
  { value: '', label: 'Cualquier puntaje' },
  { value: '0', label: '0+ (Todos)' },
  { value: '30', label: '30+' },
  { value: '50', label: '50+' },
  { value: '60', label: '60+' },
  { value: '70', label: '70+' },
  { value: '80', label: '80+ (Alto)' },
  { value: '90', label: '90+ (Excelente)' },
];

export const MatchFilterBar = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleFilterChange = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.set('page', '1');
    router.push(`/matches?${params.toString()}`);
  };

  return (
    <div className="flex flex-col gap-3 p-3 border rounded-lg bg-muted">
      <h3 className="font-semibold text-xs text-foreground uppercase tracking-wider">Filtros</h3>

      <label className="text-xs text-muted-foreground">Puntaje mínimo</label>
      <select
        key={`minScore-${searchParams.get('minScore') || ''}`}
        className="h-8 rounded-lg border border-input bg-background px-2.5 py-1 text-xs"
        defaultValue={searchParams.get('minScore') || ''}
        onChange={(e) => handleFilterChange('minScore', e.target.value)}
      >
        {SCORE_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      <Button variant="outline" size="sm" onClick={() => router.push('/matches')}>
        Limpiar
      </Button>
    </div>
  );
};
