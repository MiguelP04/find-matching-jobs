import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MatchResult } from './entities/match-result.entity';
import { Profile } from '../profiles/entities/profile.entity';
import { Job } from '../jobs/entities/job.entity';
import { Skill } from '../skills/entities/skill.entity';
import { StudentSkill } from '../skills/entities/student-skill.entity';
import { MatchingService } from './matching.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([MatchResult, Profile, Job, Skill, StudentSkill]),
  ],
  providers: [MatchingService],
  exports: [MatchingService, TypeOrmModule],
})
export class MatchingModule { }
