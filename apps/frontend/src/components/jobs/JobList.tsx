'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { getJobs, GetJobsParams } from '../../services/jobService';
import { Job } from '../../types/job';
import { JobCard } from './JobCard';
import { Button } from '../ui/button';

export const JobList = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const page = parseInt(searchParams.get('page') || '1');

  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true);
      const params: GetJobsParams = {
        location: searchParams.get('location') || undefined,
        modality: searchParams.get('modality') || undefined,
        company: searchParams.get('company') || undefined,
        minScore: searchParams.get('minScore') ? parseInt(searchParams.get('minScore')!) : undefined,
        page: page,
      };
      const result = await getJobs(params);
      setJobs(result.data);
      setTotal(result.total);
      setLoading(false);
    };

    fetchJobs();
  }, [searchParams, page]);

  if (loading) return <div>Cargando vacantes...</div>;

  return (
    <div className="flex flex-col gap-4">
      {jobs.length === 0 ? (
        <p>No se encontraron vacantes.</p>
      ) : (
        jobs.map(job => <JobCard key={job.id} job={job} />)
      )}
      
      <div className="flex justify-between mt-4">
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
        <span>Página {page} de {Math.ceil(total / 2) || 1}</span>
        <Button 
          disabled={page >= Math.ceil(total / 2)} 
          onClick={() => {
            const params = new URLSearchParams(searchParams);
            params.set('page', (page + 1).toString());
            router.push(`/jobs?${params.toString()}`);
          }}
        >
          Siguiente
        </Button>
      </div>
    </div>
  );
};
