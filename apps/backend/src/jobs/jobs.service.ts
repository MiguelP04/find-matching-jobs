import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike, MoreThanOrEqual, In } from 'typeorm';
import { subDays } from 'date-fns';
import { Job } from './entities/job.entity';
import { JobData } from './types/job-data';
import { JobsFilterDto } from './dto/jobs-filter.dto';

@Injectable()
export class JobsService {
  constructor(
    @InjectRepository(Job)
    private readonly jobsRepository: Repository<Job>,
  ) {}

  async findAll(filters: JobsFilterDto) {
    const { page = 1, limit = 10, ubicacion, empresa } = filters;
    const thirtyDaysAgo = subDays(new Date(), 30);

    const where: any = { fecha_publicacion: MoreThanOrEqual(thirtyDaysAgo) };

    if (ubicacion) {
      where.ubicacion = ILike(`%${ubicacion}%`);
    }
    if (empresa) {
      where.empresa = ILike(`%${empresa}%`);
    }

    const [jobs, total] = await this.jobsRepository.findAndCount({
      where,
      skip: (page - 1) * limit,
      take: limit,
      order: { fecha_publicacion: 'DESC' },
    });
    return { jobs, total, page, limit };
  }

  async findOne(id: number) {
    const job = await this.jobsRepository.findOne({ where: { id } });
    if (!job) throw new NotFoundException('Vacante no encontrada');
    return job;
  }

  async search(query: string, location?: string, page = 1, limit = 10) {
    const thirtyDaysAgo = subDays(new Date(), 30);
    const where: any[] = [
      {
        titulo: ILike(`%${query}%`),
        fecha_publicacion: MoreThanOrEqual(thirtyDaysAgo),
      },
      {
        empresa: ILike(`%${query}%`),
        fecha_publicacion: MoreThanOrEqual(thirtyDaysAgo),
      },
      {
        descripcion: ILike(`%${query}%`),
        fecha_publicacion: MoreThanOrEqual(thirtyDaysAgo),
      },
    ];

    if (location) {
      where.forEach((w) => (w.ubicacion = ILike(`%${location}%`)));
    }

    const [jobs, total] = await this.jobsRepository.findAndCount({
      where,
      skip: (page - 1) * limit,
      take: limit,
      order: { fecha_publicacion: 'DESC' },
    });
    return { jobs, total, page, limit };
  }

  async saveJobs(
    jobs: JobData[],
  ): Promise<{ inserted: number; skipped: number }> {
    const externalIds = jobs.map((j) => j.external_id).filter(Boolean);
    if (externalIds.length === 0) return { inserted: 0, skipped: 0 };

    const existing = await this.jobsRepository.find({
      where: { external_id: In(externalIds) },
      select: ['external_id'],
    });
    const existingSet = new Set(existing.map((j) => j.external_id));

    const newJobs = jobs.filter((j) => !existingSet.has(j.external_id));

    if (newJobs.length > 0) {
      await this.jobsRepository.save(newJobs);
    }

    return { inserted: newJobs.length, skipped: existingSet.size };
  }
}
