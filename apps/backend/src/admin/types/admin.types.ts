export interface OverviewStatsDto {
  totalEstudiantes: number;
  totalVacantes: number;
  totalVacantesActivas: number;
  totalMatches: number;
  totalMatchesActivos: number;
  promedioScore: number | null;
}

export interface SkillDemandDto {
  skill: string;
  total: number;
}

export interface StudentEmployabilityDto {
  studentId: number;
  nombre: string;
  apellido: string;
  promedioScore: number;
  totalMatches: number;
}

export interface JobsByLocationDto {
  ubicacion: string;
  total: number;
}
