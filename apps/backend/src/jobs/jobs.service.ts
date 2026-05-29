import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike, MoreThanOrEqual } from 'typeorm';
import { subDays } from 'date-fns';
import { Job } from './entities/job.entity';

@Injectable()
export class JobsService {
  constructor(
    @InjectRepository(Job)
    private readonly jobsRepository: Repository<Job>,
  ) { }

  async findAll(page = 1, limit = 10) {
    const thirtyDaysAgo = subDays(new Date(), 30);
    const [jobs, total] = await this.jobsRepository.findAndCount({
      where: { fecha_publicacion: MoreThanOrEqual(thirtyDaysAgo) },
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

  async search(query: string, location?: string) {
    const thirtyDaysAgo = subDays(new Date(), 30);
    const where: any[] = [
      { titulo: ILike(`%${query}%`), fecha_publicacion: MoreThanOrEqual(thirtyDaysAgo) },
      { empresa: ILike(`%${query}%`), fecha_publicacion: MoreThanOrEqual(thirtyDaysAgo) },
      { descripcion: ILike(`%${query}%`), fecha_publicacion: MoreThanOrEqual(thirtyDaysAgo) },
    ];

    if (location) {
      where.forEach((w) => (w.ubicacion = ILike(`%${location}%`)));
    }

    return this.jobsRepository.find({ where, order: { fecha_publicacion: 'DESC' } });
  }
}
