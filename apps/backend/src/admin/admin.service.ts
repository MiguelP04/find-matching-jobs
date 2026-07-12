import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { subDays } from 'date-fns';
import { User } from '../users/entities/user.entity';
import { Profile } from '../profiles/entities/profile.entity';
import { Job } from '../jobs/entities/job.entity';
import { MatchResult } from '../matching/entities/match-result.entity';
import { StudentSkill } from '../skills/entities/student-skill.entity';
import {
  OverviewStatsDto,
  SkillDemandDto,
  StudentEmployabilityDto,
  JobsByLocationDto,
} from './types/admin.types';

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Profile)
    private readonly profileRepository: Repository<Profile>,
    @InjectRepository(Job)
    private readonly jobRepository: Repository<Job>,
    @InjectRepository(MatchResult)
    private readonly matchResultRepository: Repository<MatchResult>,
    @InjectRepository(StudentSkill)
    private readonly studentSkillRepository: Repository<StudentSkill>,
  ) {}

  async getOverview(): Promise<OverviewStatsDto> {
    this.logger.log('Generating overview stats');

    const thirtyDaysAgo = subDays(new Date(), 30);

    const [
      totalEstudiantes,
      totalVacantes,
      totalVacantesActivas,
      totalMatches,
      totalMatchesActivos,
      avgResult,
    ] = await Promise.all([
      this.userRepository
        .createQueryBuilder('u')
        .where("u.rol = 'estudiante'")
        .getCount(),
      this.jobRepository.createQueryBuilder('j').getCount(),
      this.jobRepository
        .createQueryBuilder('j')
        .where('j.fecha_publicacion >= :thirtyDaysAgo', { thirtyDaysAgo })
        .getCount(),
      this.matchResultRepository.createQueryBuilder('m').getCount(),
      this.matchResultRepository
        .createQueryBuilder('m')
        .innerJoin('m.job', 'j')
        .where('j.fecha_publicacion >= :thirtyDaysAgo', { thirtyDaysAgo })
        .getCount(),
      this.matchResultRepository
        .createQueryBuilder('m')
        .select('AVG(m.score)', 'avg')
        .getRawOne<{ avg: string | null }>(),
    ]);

    return {
      totalEstudiantes,
      totalVacantes,
      totalVacantesActivas,
      totalMatches,
      totalMatchesActivos,
      promedioScore: avgResult?.avg
        ? Math.round(parseFloat(avgResult.avg) * 100) / 100
        : null,
    };
  }

  async getSkillsDemand(): Promise<SkillDemandDto[]> {
    this.logger.log('Generating skills demand stats');

    return this.studentSkillRepository
      .createQueryBuilder('ss')
      .innerJoin('ss.skill', 's')
      .select('s.nombre', 'skill')
      .addSelect('COUNT(*)', 'total')
      .groupBy('s.nombre')
      .orderBy('total', 'DESC')
      .getRawMany<SkillDemandDto>();
  }

  async getStudentsEmployability(): Promise<StudentEmployabilityDto[]> {
    this.logger.log('Generating students employability stats');

    const rows = await this.profileRepository
      .createQueryBuilder('p')
      .innerJoin('p.user', 'u')
      .innerJoin('p.matchResults', 'm')
      .select('p.id', 'studentId')
      .addSelect('u.nombre', 'nombre')
      .addSelect('u.apellido', 'apellido')
      .addSelect('AVG(m.score)', 'promedioScore')
      .addSelect('COUNT(*)', 'totalMatches')
      .groupBy('p.id')
      .addGroupBy('u.nombre')
      .addGroupBy('u.apellido')
      .orderBy('"promedioScore"', 'DESC')
      .limit(10)
      .getRawMany<Record<string, string>>();

    return rows.map((row) => ({
      studentId: Number(row.studentId),
      nombre: row.nombre,
      apellido: row.apellido,
      promedioScore: Math.round(parseFloat(row.promedioScore) * 100) / 100,
      totalMatches: Number(row.totalMatches),
    }));
  }

  async getJobsByLocation(): Promise<JobsByLocationDto[]> {
    this.logger.log('Generating jobs by location stats');

    const rows = await this.jobRepository
      .createQueryBuilder('j')
      .select('j.ubicacion', 'ubicacion')
      .addSelect('COUNT(*)', 'total')
      .groupBy('j.ubicacion')
      .orderBy('"total"', 'DESC')
      .getRawMany<Record<string, string>>();

    return rows.map((row) => ({
      ubicacion: row.ubicacion,
      total: Number(row.total),
    }));
  }
}
