import { Controller, Get, Post, Param, Query, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { JsearchService } from '../jsearch/jsearch.service';
import { JobsService } from './jobs.service';
import { PaginationDto } from '@find-matching-jobs/types';
import { SearchJobsDto } from './dto/search-jobs.dto';
import { UserRole } from '@find-matching-jobs/types';

@Controller('jobs')
@ApiTags('jobs')
@UseGuards(JwtAuthGuard)
export class JobsController {
  constructor(
    private readonly jobsService: JobsService,
    private readonly jsearchService: JsearchService,
  ) { }

  @Get()
  findAll(@Query() query: PaginationDto) {
    return this.jobsService.findAll(query.page, query.limit);
  }

  @Get('search')
  @ApiOperation({ summary: 'Buscar vacantes en DB local' })
  searchLocal(@Query() searchDto: SearchJobsDto) {
    return this.jobsService.search(searchDto.query, searchDto.location);
  }

  @Post('sync')
  @Roles(UserRole.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async sync(@Query() searchDto: SearchJobsDto) {
    const result = await this.jsearchService.syncJobs(searchDto.query, searchDto.location);
    return result;
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.jobsService.findOne(Number(id));
  }

}
