export interface Job {
  id: number;
  external_id: string;
  titulo: string;
  empresa: string;
  descripcion: string;
  ubicacion: string;
  url_postulacion: string;
  fecha_publicacion: string;
}

export interface MatchResult {
  id: number;
  score: number;
  justificacion_ia: string;
  missing_skills: string[];
  fecha_analisis: string;
  student_id: number;
  job_id: number;
  job: Job;
}

export interface MatchesResponse {
  data: MatchResult[];
  total: number;
  page: number;
  limit: number;
}
