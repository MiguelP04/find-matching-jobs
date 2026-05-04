import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Skill } from './entities/skill.entity'
import { StudentSkill } from './entities/student-skill.entity'

@Module({
  imports: [TypeOrmModule.forFeature([Skill, StudentSkill])],
  exports: [TypeOrmModule],
})
export class SkillsModule {}
