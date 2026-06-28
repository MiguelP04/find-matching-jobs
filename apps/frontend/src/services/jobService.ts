import { api } from "../lib/api";
import { Job, JobsResponse } from "../types/job";
import { useAuthStore } from "../stores/authStore";

export interface GetJobsParams {
  ubicacion?: string;
  empresa?: string;
  page?: number;
  limit?: number;
}

export const getJobs = async (
  params: GetJobsParams,
): Promise<{ jobs: Job[]; total: number }> => {
  const token = useAuthStore.getState().accessToken;
  const queryParams = new URLSearchParams();

  if (params.ubicacion) queryParams.set("ubicacion", params.ubicacion);
  if (params.empresa) queryParams.set("empresa", params.empresa);
  if (params.page) queryParams.set("page", params.page.toString());
  if (params.limit) queryParams.set("limit", params.limit.toString());

  const qs = queryParams.toString();
  const res = await api.get<JobsResponse>(
    `/jobs${qs ? `?${qs}` : ""}`,
    token ?? undefined,
  );

  return { jobs: res.jobs, total: res.total };
};
