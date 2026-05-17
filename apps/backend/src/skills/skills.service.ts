import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Skill } from './entities/skill.entity';
import { Repository, ILike } from 'typeorm';
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

  async findOne(id: number) {
    const skill = await this.skillsRepository.findOne({ where: { id } });
    if (!skill) {
      throw new NotFoundException('Skill not found');
    }
    return skill;
  }

  async createSkill(createSkillDto: CreateSkillDto) {
    const existing = await this.skillsRepository.findOne({
      where: { nombre: ILike(createSkillDto.name) },
    });

    if (existing) {
      throw new ConflictException(
        `La habilidad '${createSkillDto.name}' ya existe`,
      );
    }

    const skill = this.skillsRepository.create({ nombre: createSkillDto.name });
    return this.skillsRepository.save(skill);
  }

  async updateSkill(id: number, updateSkillDto: CreateSkillDto) {
    const skill = await this.findOne(id);
    skill.nombre = updateSkillDto.name;
    return this.skillsRepository.save(skill);
  }

  async removeSkill(id: number) {
    await this.findOne(id);
    await this.skillsRepository.delete(id);
    return { message: 'Skill deleted successfully' };
  }
}
