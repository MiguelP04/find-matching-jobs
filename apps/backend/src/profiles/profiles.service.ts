import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Profile } from './entities/profile.entity';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class ProfilesService {
  constructor(
    @InjectRepository(Profile)
    private profilesRepository: Repository<Profile>,
  ) {}

  async create(userId: number, createProfileDto: CreateProfileDto): Promise<Profile> {
    const existing = await this.profilesRepository.findOne({ where: { user_id: userId } });
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

  async update(userId: number, updateProfileDto: UpdateProfileDto): Promise<Profile> {
    const profile = await this.findByUserId(userId);
    Object.assign(profile, updateProfileDto);
    return await this.profilesRepository.save(profile);
  }
}
