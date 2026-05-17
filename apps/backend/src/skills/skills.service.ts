import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Skill } from './entities/skill.entity';
import { Repository } from 'typeorm';
import { CreateSkillDto } from '@find-matching-jobs/types';

@Injectable()
export class SkillsService {
  constructor(
    @InjectRepository(Skill)
    private readonly skillsRepository: Repository<Skill>,
  ) {}

  findAll() {
    return this.skillsRepository.find();
  }

  createSkill(createSkillDto: CreateSkillDto) {
    const skill = this.skillsRepository.create({ nombre: createSkillDto.name });
    return this.skillsRepository.save(skill);
  }
}
