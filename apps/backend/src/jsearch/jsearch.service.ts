import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { JobData } from '../jobs/types/job-data';

@Injectable()
export class JsearchService {
  private readonly logger = new Logger(JsearchService.name);
  private readonly apiKey: string;
  private readonly baseUrl = 'https://jsearch.p.rapidapi.com';

  constructor(configService: ConfigService) {
    this.apiKey = configService.getOrThrow<string>('JSEARCH_API_KEY');
  }

  async fetchJobs(query: string, location?: string): Promise<JobData[]> {
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

      return (data.data ?? []).map((j: any) => ({
        external_id: j.job_id,
        titulo: j.job_title,
        empresa: j.employer_name,
        descripcion: j.job_description ?? '',
        ubicacion: [j.job_city, j.job_state, j.job_country].filter(Boolean).join(', '),
        url_postulacion: j.job_apply_link ?? '',
        fecha_publicacion: new Date(j.job_posted_at_timestamp * 1000),
      }));
    } catch (error: any) {
      this.logger.error(`JSearch API error: ${error.message}`);
      throw new InternalServerErrorException('Error al obtener vacantes de JSearch');
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