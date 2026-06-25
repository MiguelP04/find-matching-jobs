'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '../ui/button';

const SCORE_OPTIONS = [
  { value: '', label: 'Cualquier score' },
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
    <div className="flex flex-col gap-4 p-4 border rounded-lg bg-gray-50">
      <h3 className="font-semibold text-sm text-gray-700">Filtros</h3>

      <label className="text-xs text-gray-500">Score mínimo</label>
      <select
        key={`minScore-${searchParams.get('minScore') || ''}`}
        className="h-8 rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm"
        defaultValue={searchParams.get('minScore') || ''}
        onChange={(e) => handleFilterChange('minScore', e.target.value)}
      >
        {SCORE_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      <Button
        variant="outline"
        onClick={() => router.push('/matches')}
      >
        Limpiar filtros
      </Button>
    </div>
  );
};
