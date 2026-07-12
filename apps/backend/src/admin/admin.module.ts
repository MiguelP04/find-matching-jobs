import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { Profile } from '../profiles/entities/profile.entity';
import { Job } from '../jobs/entities/job.entity';
import { MatchResult } from '../matching/entities/match-result.entity';
import { Skill } from '../skills/entities/skill.entity';
import { StudentSkill } from '../skills/entities/student-skill.entity';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Profile,
      Job,
      MatchResult,
      Skill,
      StudentSkill,
    ]),
  ],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
