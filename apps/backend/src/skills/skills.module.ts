import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Skill } from './entities/skill.entity';
import { StudentSkill } from './entities/student-skill.entity';
import { SkillsController } from './skills.controller';
import { SkillsService } from './skills.service';
import { StudentSkillsController } from './student-skills.controller';
import { StudentSkillsService } from './student-skills.service';
import { ProfilesModule } from '../profiles/profiles.module';
import { MatchingModule } from '../matching/matching.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Skill, StudentSkill]),
    ProfilesModule,
    MatchingModule,
  ],
  controllers: [SkillsController, StudentSkillsController],
  providers: [SkillsService, StudentSkillsService],
  exports: [TypeOrmModule],
})
export class SkillsModule {}
