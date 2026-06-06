import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { JsearchService } from '../jsearch/jsearch.service';
import { JobsService } from './jobs.service';


@Injectable()
export class JobsCronService {
  private readonly logger = new Logger(JobsCronService.name);
  constructor(
    private readonly jsearchService: JsearchService,
    private readonly jobsService: JobsService,
  ) { }

  @Cron('0 0 * * 0')
  async weeklySync() {
    this.logger.log('Iniciando sync semanal automático...');
    const queries = ['react', 'node', 'python', 'backend', 'frontend', 'devops', 'fullstack'];
    for (const query of queries) {
      try {

        const jobs = await this.jsearchService.fetchJobs(query);
        const result = await this.jobsService.saveJobs(jobs);
        this.logger.log(`[${query}] => insertados: ${result.inserted}, omitidos: ${result.skipped}`);
      } catch (error: any) {
        this.logger.error(`[${query}] Error: ${error.message}`);
      }
    }
    this.logger.log('Sync semanal completado');
  }
}