import { api } from '../lib/api';
import { MatchResult, MatchesResponse } from '../types/job';
import { useAuthStore } from '../stores/authStore';

export interface GetMatchesParams {
  minScore?: number;
  page?: number;
  limit?: number;
}

export const getMatches = async (params: GetMatchesParams): Promise<{ data: MatchResult[]; total: number }> => {
  const token = useAuthStore.getState().accessToken;
  const queryParams = new URLSearchParams();

  if (params.minScore !== undefined) queryParams.set('min_score', params.minScore.toString());
  if (params.page) queryParams.set('page', params.page.toString());
  if (params.limit) queryParams.set('limit', params.limit.toString());

  const qs = queryParams.toString();
  const res = await api.get<MatchesResponse>(`/matches/me${qs ? `?${qs}` : ''}`, token ?? undefined);

  return { data: res.data, total: res.total };
};

export const matchWithJob = async (jobId: number, useAI = true): Promise<MatchResult> => {
  const token = useAuthStore.getState().accessToken;
  const qs = useAI ? '?useAI=true' : '';
  const res = await api.post<MatchResult>(`/matches/job/${jobId}${qs}`, undefined, token ?? undefined);
  return res as MatchResult;
};
