import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Profile } from './entities/profile.entity';
import { ProfilesService } from './profiles.service';
import { ProfilesController } from './profiles.controller';
import { MatchingModule } from '../matching/matching.module';

@Module({
  imports: [TypeOrmModule.forFeature([Profile]), MatchingModule],
  controllers: [ProfilesController],
  providers: [ProfilesService],
  exports: [TypeOrmModule, ProfilesService],
})
export class ProfilesModule {}
