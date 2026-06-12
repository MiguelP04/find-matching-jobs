import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { MatchingService } from './matching.service';

@ApiTags('matching')
@Controller('matching')
@UseGuards(JwtAuthGuard)
export class MatchingController {
  constructor(
    private readonly matchingService: MatchingService,
  ) {}

  @Post('sync')
  @ApiOperation({
    summary:
      'Ejecutar matching para el estudiante actual vs todas las vacantes',
  })
  async syncMyMatches(
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

  @Get('my-matches')
  @ApiOperation({
    summary: 'Obtener los resultados de matching del estudiante actual',
  })
  async getMyMatches(@CurrentUser() user: JwtPayload) {
    return this.matchingService.getMatchesForUser(user.userId);
  }

  @Post('job/:jobId')
  @ApiOperation({
    summary: 'Calcular y guardar el matching para una vacante específica',
  })
  async matchWithJob(
    @Param('jobId') jobId: number,
    @CurrentUser() user: JwtPayload,
    @Query('useAI') useAI?: string,
  ) {
    const shouldIgnoreAI = useAI !== 'true';
    return this.matchingService.matchStudentToJob(user.userId, Number(jobId), {
      useAI: !shouldIgnoreAI,
    });
  }
}
