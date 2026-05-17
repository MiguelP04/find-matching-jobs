import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Skill } from './entities/skill.entity';
import { StudentSkill } from './entities/student-skill.entity';
import { SkillsController } from './skills.controller';
import { SkillsService } from './skills.service';

@Module({
  imports: [TypeOrmModule.forFeature([Skill, StudentSkill])],
  controllers: [SkillsController],
  providers: [SkillsService],
  exports: [TypeOrmModule],
})
export class SkillsModule {}
