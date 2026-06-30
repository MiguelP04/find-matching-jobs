import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Job } from './entities/job.entity';
import { MatchResult } from '../matching/entities/match-result.entity';
import { Profile } from '../profiles/entities/profile.entity';
import { JobsService } from './jobs.service';
import { JobsController } from './jobs.controller';
import { JsearchModule } from '../jsearch/jsearch.module';
import { ScheduleModule } from '@nestjs/schedule';
import { JobsCronService } from './jobs-cron.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Job, MatchResult, Profile]),
    ScheduleModule.forRoot(),
    JsearchModule,
  ],
  exports: [TypeOrmModule, JobsService],
  controllers: [JobsController],
  providers: [JobsService, JobsCronService],
})
export class JobsModule {}
