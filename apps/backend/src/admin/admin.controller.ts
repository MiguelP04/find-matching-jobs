import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

@Controller('admin/stats')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@ApiTags('Admin Stats')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('overview')
  @ApiOperation({ summary: 'Obtener estadísticas generales del panel admin' })
  @ApiResponse({
    status: 200,
    description: 'Estadísticas generales retornadas exitosamente',
  })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'Sin permisos de administrador' })
  getOverview() {
    return this.adminService.getOverview();
  }

  @Get('skills-demand')
  @ApiOperation({
    summary: 'Obtener habilidades más demandadas por los estudiantes',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de skills ordenadas por frecuencia',
  })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'Sin permisos de administrador' })
  getSkillsDemand() {
    return this.adminService.getSkillsDemand();
  }

  @Get('students-employability')
  @ApiOperation({
    summary: 'Obtener top estudiantes con mejores scores de match',
  })
  @ApiResponse({
    status: 200,
    description: 'Top 10 estudiantes ordenados por promedio de score',
  })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'Sin permisos de administrador' })
  getStudentsEmployability() {
    return this.adminService.getStudentsEmployability();
  }

  @Get('jobs-by-location')
  @ApiOperation({
    summary: 'Obtener distribución de vacantes por ubicación',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de ubicaciones ordenadas por cantidad de vacantes',
  })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'Sin permisos de administrador' })
  getJobsByLocation() {
    return this.adminService.getJobsByLocation();
  }
}
