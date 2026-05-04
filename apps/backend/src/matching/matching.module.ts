import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { MatchResult } from './entities/match-result.entity'

@Module({
  imports: [TypeOrmModule.forFeature([MatchResult])],
  exports: [TypeOrmModule],
})
export class MatchingModule {}
