'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '../ui/button';
import { mockJobs } from '../../lib/mockJobs';

const locations = [...new Set(mockJobs.map(j => j.location))];
const companies = [...new Set(mockJobs.map(j => j.company))];

export const JobFilterBar = () => {
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
    router.push(`/jobs?${params.toString()}`);
  };

  return (
    <div className="flex flex-col gap-4 p-4 border rounded-lg bg-gray-50">
      <select
        key={`location-${searchParams.get('location') || ''}`}
        className="h-8 rounded-lg border border-input bg-transparent px-2.5 py-1"
        defaultValue={searchParams.get('location') || ''}
        onChange={(e) => handleFilterChange('location', e.target.value)}
      >
        <option value="">Cualquier ubicación</option>
        {locations.map(loc => (
          <option key={loc} value={loc}>{loc}</option>
        ))}
      </select>

      <select
        key={`company-${searchParams.get('company') || ''}`}
        className="h-8 rounded-lg border border-input bg-transparent px-2.5 py-1"
        defaultValue={searchParams.get('company') || ''}
        onChange={(e) => handleFilterChange('company', e.target.value)}
      >
        <option value="">Cualquier empresa</option>
        {companies.map(c => (
          <option key={c} value={c}>{c}</option>
        ))}
      </select>

      <select
        key={`modality-${searchParams.get('modality') || ''}`}
        className="h-8 rounded-lg border border-input bg-transparent px-2.5 py-1"
        defaultValue={searchParams.get('modality') || ''}
        onChange={(e) => handleFilterChange('modality', e.target.value)}
      >
        <option value="">Cualquier modalidad</option>
        <option value="Remoto">Remoto</option>
        <option value="Presencial">Presencial</option>
        <option value="Híbrido">Híbrido</option>
      </select>

      <Button onClick={() => router.push('/jobs')}>Limpiar filtros</Button>
    </div>
  );
};
