import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { JsearchService } from '../jsearch/jsearch.service';
import { JobsService } from './jobs.service';
import { MatchingService } from '../matching/matching.service';

@Injectable()
export class JobsCronService {
  private readonly logger = new Logger(JobsCronService.name);
  constructor(
    private readonly jsearchService: JsearchService,
    private readonly jobsService: JobsService,
    private readonly matchingService: MatchingService,
  ) {}

  @Cron('0 0 * * 0')
  async weeklySync() {
    this.logger.log('Iniciando sync semanal automático...');
    const queries = [
      'react',
      'node',
      'python',
      'backend',
      'frontend',
      'devops',
      'fullstack',
    ];
    const allNewJobIds: Set<number> = new Set();

    for (const query of queries) {
      try {
        const jobs = await this.jsearchService.fetchJobs(query);
        const result = await this.jobsService.saveJobs(jobs);
        this.logger.log(
          `[${query}] => insertados: ${result.inserted}, omitidos: ${result.skipped}`,
        );
        for (const id of result.insertedIds) {
          allNewJobIds.add(id);
        }
      } catch (error: any) {
        this.logger.error(`[${query}] Error: ${error.message}`);
      }
    }

    const newJobIds = Array.from(allNewJobIds);
    if (newJobIds.length > 0) {
      this.logger.log(
        `Sincronizados ${newJobIds.length} jobs nuevos. Iniciando matching...`,
      );
      this.matchingService
        .matchAllStudentsToNewJobs(newJobIds)
        .then((results) => {
          const total = results.reduce((sum, r) => sum + r.count, 0);
          this.logger.log(
            `Matching completado para ${results.length} estudiantes, ${total} resultados`,
          );
        })
        .catch((err: Error) =>
          this.logger.error(
            `Background matching error after cron sync: ${err.message}`,
          ),
        );
    }

    this.logger.log('Sync semanal completado');
  }
}
