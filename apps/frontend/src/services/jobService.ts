import { mockJobs } from '../lib/mockJobs';
import { Job } from '../types/job';

export interface GetJobsParams {
  location?: string;
  modality?: string;
  company?: string;
  minScore?: number;
  page?: number;
}

export const getJobs = async (params: GetJobsParams): Promise<{ data: Job[], total: number }> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));

  let filteredJobs = [...mockJobs];

  if (params.location) {
    filteredJobs = filteredJobs.filter(job => job.location.toLowerCase().includes(params.location!.toLowerCase()));
  }
  if (params.modality) {
    filteredJobs = filteredJobs.filter(job => job.modality === params.modality);
  }
  if (params.company) {
    filteredJobs = filteredJobs.filter(job => job.company.toLowerCase().includes(params.company!.toLowerCase()));
  }
  if (params.minScore) {
    filteredJobs = filteredJobs.filter(job => job.score >= params.minScore!);
  }

  const page = params.page || 1;
  const pageSize = 2;
  const start = (page - 1) * pageSize;
  const paginatedJobs = filteredJobs.slice(start, start + pageSize);

  return {
    data: paginatedJobs,
    total: filteredJobs.length
  };
};
