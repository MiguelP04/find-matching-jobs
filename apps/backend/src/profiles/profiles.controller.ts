import { Controller, Get, Post, Patch, Body, UseGuards, Request } from '@nestjs/common';
import { Request as ExpressRequest } from 'express';
import { ProfilesService } from './profiles.service';
import { CreateProfileDto, UpdateProfileDto } from '@find-matching-jobs/types';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SanitizationPipe } from '../common/pipes/sanitization.pipe';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';

@Controller('profiles')
@UseGuards(JwtAuthGuard)
export class ProfilesController {
  constructor(private readonly profilesService: ProfilesService) {}

  @Post()
  create(
    @Body(new SanitizationPipe()) createProfileDto: CreateProfileDto,
    @Request() req: ExpressRequest & { user: JwtPayload },
  ) {
    return this.profilesService.create(req.user.userId, createProfileDto);
  }

  @Get('me')
  findMe(
    @Request() req: ExpressRequest & { user: JwtPayload },
  ) {
    return this.profilesService.findByUserId(req.user.userId);
  }

  @Patch('me')
  update(
    @Body(new SanitizationPipe()) updateProfileDto: UpdateProfileDto,
    @Request() req: ExpressRequest & { user: JwtPayload },
  ) {
    return this.profilesService.update(req.user.userId, updateProfileDto);
  }
}
