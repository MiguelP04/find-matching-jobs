import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Job } from '../jobs/entities/job.entity';
import { JsearchService } from './jsearch.service';

@Module({
  imports: [TypeOrmModule.forFeature([Job])],
  providers: [JsearchService],
  exports: [JsearchService],
})

export class JsearchModule { }
