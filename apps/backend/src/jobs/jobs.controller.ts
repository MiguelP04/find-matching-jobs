import { Controller, Get, Post, Param, Query, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { JsearchService } from '../jsearch/jsearch.service';
import { JobsService } from './jobs.service';
import { SearchJobsDto, UserRole } from '@find-matching-jobs/types';
import { JobsFilterDto } from './dto/jobs-filter.dto';

@Controller('jobs')
@ApiTags('jobs')
@UseGuards(JwtAuthGuard)
export class JobsController {
  constructor(
    private readonly jobsService: JobsService,
    private readonly jsearchService: JsearchService,
  ) {}

  @Get()
  findAll(@Query() query: JobsFilterDto) {
    return this.jobsService.findAll(query);
  }

  @Get('search')
  @ApiOperation({ summary: 'Buscar vacantes en DB local' })
  searchLocal(@Query() searchDto: SearchJobsDto) {
    return this.jobsService.search(
      searchDto.query,
      searchDto.location,
      searchDto.page,
      searchDto.limit,
    );
  }

  @Post('sync')
  @Roles(UserRole.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async sync(@Query() searchDto: SearchJobsDto) {
    const jobs = await this.jsearchService.fetchJobs(
      searchDto.query,
      searchDto.location,
    );
    const result = await this.jobsService.saveJobs(jobs);
    return { provider: 'jsearch', ...result };
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.jobsService.findOne(Number(id));
  }
}
