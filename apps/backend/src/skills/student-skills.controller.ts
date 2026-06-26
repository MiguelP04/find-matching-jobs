import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { StudentSkillsService } from './student-skills.service';
import {
  CreateStudentSkillDto,
  UpdateStudentSkillDto,
} from '@find-matching-jobs/types';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole } from '@find-matching-jobs/types';
import type { JwtPayload } from '../auth/interfaces/jwt-payload.interface';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ESTUDIANTE)
@Controller('student-skills')
export class StudentSkillsController {
  constructor(private readonly studentSkillsService: StudentSkillsService) {}

  @Post()
  addSkill(
    @Body() createDto: CreateStudentSkillDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.studentSkillsService.addSkill(user.userId, createDto);
  }

  @Get('me')
  getMySkills(@CurrentUser() user: JwtPayload) {
    return this.studentSkillsService.getMySkills(user.userId);
  }

  @Patch(':id')
  updateSkillLevel(
    @Param('id') id: string,
    @Body() updateDto: UpdateStudentSkillDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.studentSkillsService.updateSkillLevel(
      user.userId,
      Number(id),
      updateDto,
    );
  }

  @Delete(':id')
  removeSkill(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.studentSkillsService.removeSkill(user.userId, Number(id));
  }
}
