import { Controller, Get, Post, Param, Query, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiParam, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { MatchingService } from './matching.service';
import { MatchesQueryDto } from './dto/matches-query.dto';

@ApiTags('matches')
@Controller('matches')
@UseGuards(JwtAuthGuard)
export class MatchesController {
  constructor(private readonly matchingService: MatchingService) {}

  @Get('me')
  @ApiOperation({
    summary: 'Obtener todos mis matches ordenados por score descendente',
  })
  @ApiQuery({
    name: 'min_score',
    required: false,
    type: Number,
    description: 'Puntaje mínimo (0-100)',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Número de página (default: 1)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Resultados por página (default: 10)',
  })
  async getMyMatches(
    @CurrentUser() user: JwtPayload,
    @Query() query: MatchesQueryDto,
  ) {
    return this.matchingService.getMatchesForUser(user.userId, {
      minScore: query.minScore,
      page: query.page,
      limit: query.limit,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener detalle de un match específico' })
  @ApiParam({ name: 'id', type: Number, description: 'ID del match result' })
  async getMatchById(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.matchingService.getMatchById(Number(id), user.userId);
  }

  @Post('refresh')
  @ApiOperation({
    summary:
      'Re-ejecutar matching para el estudiante actual vs todas las vacantes activas',
  })
  @ApiQuery({
    name: 'useAI',
    required: false,
    type: String,
    description: 'Usar IA para justificación',
  })
  async refreshMatches(
    @CurrentUser() user: JwtPayload,
    @Query('useAI') useAI?: string,
  ) {
    const shouldIgnoreAI = useAI !== 'true';
    const results = await this.matchingService.matchStudentToAllJobs(
      user.userId,
      { useAI: !shouldIgnoreAI },
    );
    return {
      message: 'Matching completado con éxito',
      count: results.length,
      results,
    };
  }

  @Post('job/:jobId')
  @ApiOperation({
    summary: 'Calcular y guardar el matching para una vacante específica',
  })
  @ApiParam({ name: 'jobId', type: Number, description: 'ID de la vacante' })
  @ApiQuery({
    name: 'useAI',
    required: false,
    type: String,
    description: 'Usar IA para justificación',
  })
  async matchWithJob(
    @Param('jobId') jobId: string,
    @CurrentUser() user: JwtPayload,
    @Query('useAI') useAI?: string,
  ) {
    const shouldIgnoreAI = useAI !== 'true';
    return this.matchingService.matchStudentToJob(user.userId, Number(jobId), {
      useAI: !shouldIgnoreAI,
    });
  }
}
