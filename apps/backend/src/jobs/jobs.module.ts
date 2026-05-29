import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Job } from './entities/job.entity';
import { JobsService } from './jobs.service';
import { JobsController } from './jobs.controller';
import { JsearchService } from '../jsearch/jsearch.service';
import { ScheduleModule } from '@nestjs/schedule';
import { JobsCronService } from './jobs-cron.service';

@Module({
  imports: [TypeOrmModule.forFeature([Job]), ScheduleModule.forRoot()],
  exports: [TypeOrmModule, JobsService],
  controllers: [JobsController],
  providers: [JobsService, JsearchService, JobsCronService],
})
export class JobsModule { }
