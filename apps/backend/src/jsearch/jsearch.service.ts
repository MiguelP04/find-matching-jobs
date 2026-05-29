import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import axios from 'axios';
import { Job } from '../jobs/entities/job.entity';

@Injectable()
export class JsearchService {
  private readonly logger = new Logger(JsearchService.name);
  private readonly apiKey: string;
  private readonly baseUrl = 'https://jsearch.p.rapidapi.com';

  constructor(
    @InjectRepository(Job)
    private readonly JobsRepository: Repository<Job>,
    configService: ConfigService,
  ) {
    this.apiKey = configService.getOrThrow<string>('JSEARCH_API_KEY');
  }

  async syncJobs(query: string, location?: string) {
    try {
      const params: Record<string, string | number> = {
        query: location ? `${query} in ${location}` : query,
        page: 1,
        num_pages: 5,
        date_posted: 'month',
      };

      const { data } = await axios.get(`${this.baseUrl}/search`, {
        params,
        headers: {
          'X-RapidAPI-Key': this.apiKey,
          'X-RapidAPI-Host': 'jsearch.p.rapidapi.com',
        },
        timeout: 30000,
      });

      const jobs = data.data ?? [];
      const externalIds = jobs.map((j: any) => j.job_id).filter(Boolean);

      if (externalIds.length === 0) return { inserted: 0, skipped: 0 };

      const existing = await this.JobsRepository.find({
        where: { external_id: In(externalIds) },
        select: ['external_id'],
      });
      const existingSet = new Set(existing.map((j) => j.external_id));

      const newJobs = jobs
        .filter((j: any) => !existingSet.has(j.job_id))
        .map((j: any) => ({
          external_id: j.job_id,
          titulo: j.job_title,
          empresa: j.employer_name,
          descripcion: j.job_description ?? '',
          ubicacion: [j.job_city, j.job_state, j.job_country].filter(Boolean).join(', '),
          url_postulacion: j.job_apply_link ?? '',
          fecha_publicacion: new Date(j.job_posted_at_timestamp * 1000),
        }));

      if (newJobs.length > 0) {
        await this.JobsRepository.save(newJobs);
      }

      return { inserted: newJobs.length, skipped: existingSet.size };
    } catch (error: any) {
      this.logger.error(`JSearch sync error: ${error.message}`);
      throw new InternalServerErrorException('Error al sincronizar vacantes');
    }
  }

  async searchJobs(query: string, location?: string, page = 1) {
    try {
      const params: Record<string, string | number> = {
        query: location ? `${query} in ${location}` : query,
        page,
        num_pages: 1,
      };

      const { data } = await axios.get(`${this.baseUrl}/search`, {
        params,
        headers: {
          'X-RapidAPI-Key': this.apiKey,
          'X-RapidAPI-Host': 'jsearch.p.rapidapi.com',
        },
      });

      return data;
    } catch (error: any) {
      this.logger.error(`JSearch API error: ${error.message}`);
      throw new InternalServerErrorException('Error al buscar vacantes');
    }
  }
}