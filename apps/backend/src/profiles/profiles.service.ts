import {
  Injectable,
  NotFoundException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Profile } from './entities/profile.entity';
import { MatchingService } from '../matching/matching.service';
import { CreateProfileDto, UpdateProfileDto } from '@find-matching-jobs/types';

@Injectable()
export class ProfilesService {
  private readonly logger = new Logger(ProfilesService.name);

  constructor(
    @InjectRepository(Profile)
    private profilesRepository: Repository<Profile>,
    private readonly matchingService: MatchingService,
  ) {}

  async create(
    userId: number,
    createProfileDto: CreateProfileDto,
  ): Promise<Profile> {
    const existing = await this.profilesRepository.findOne({
      where: { user_id: userId },
    });
    if (existing) {
      throw new ConflictException('El usuario ya tiene un perfil');
    }

    const profile = this.profilesRepository.create({
      ...createProfileDto,
      user_id: userId,
    });
    return await this.profilesRepository.save(profile);
  }

  async findByUserId(userId: number): Promise<Profile> {
    const profile = await this.profilesRepository.findOne({
      where: { user_id: userId },
      relations: ['user'],
    });
    if (!profile) {
      throw new NotFoundException('Perfil no encontrado');
    }
    return profile;
  }

  async update(
    userId: number,
    updateProfileDto: UpdateProfileDto,
  ): Promise<Profile> {
    const profile = await this.findByUserId(userId);
    const oldModality = profile.modalidad_preferida;
    Object.assign(profile, updateProfileDto);
    const saved = await this.profilesRepository.save(profile);

    if (oldModality !== saved.modalidad_preferida) {
      this.matchingService
        .matchStudentToAllJobs(userId, { useAI: true })
        .catch((err: Error) =>
          this.logger.error(
            `Background matching error after profile update: ${err.message}`,
          ),
        );
    }

    return saved;
  }
}
