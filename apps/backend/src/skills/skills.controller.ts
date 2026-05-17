import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { SkillsService } from './skills.service';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { UserRole } from '@find-matching-jobs/types';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CreateSkillDto } from '@find-matching-jobs/types';

@Controller('skills')
export class SkillsController {
  constructor(private readonly skillsService: SkillsService) {}

  @Get()
  findAll() {
    return this.skillsService.findAll();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post()
  createSkill(@Body() createSkillDto: CreateSkillDto) {
    return this.skillsService.createSkill(createSkillDto);
  }
}
