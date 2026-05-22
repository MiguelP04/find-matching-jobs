import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StudentSkill } from './entities/student-skill.entity';
import { Skill } from './entities/skill.entity';
import { ProfilesService } from '../profiles/profiles.service';
import {
  CreateStudentSkillDto,
  UpdateStudentSkillDto,
} from '@find-matching-jobs/types';

@Injectable()
export class StudentSkillsService {
  constructor(
    @InjectRepository(StudentSkill)
    private readonly studentSkillsRepository: Repository<StudentSkill>,
    @InjectRepository(Skill)
    private readonly skillsRepository: Repository<Skill>,
    private readonly profilesService: ProfilesService,
  ) {}

  async addSkill(userId: number, createDto: CreateStudentSkillDto) {
    const profile = await this.profilesService.findByUserId(userId);
    const skill = await this.skillsRepository.findOne({
      where: { id: createDto.skill_id },
    });
    if (!skill) {
      throw new NotFoundException('Skill not found in the catalog');
    }

    const existing = await this.studentSkillsRepository.findOne({
      where: { student_id: profile.id, skill_id: skill.id },
    });
    if (existing) {
      throw new ConflictException(
        'You already added this skill to your profile',
      );
    }

    const newStudentSkill = this.studentSkillsRepository.create({
      student_id: profile.id,
      skill_id: skill.id,
      nivel: createDto.nivel,
    });

    return this.studentSkillsRepository.save(newStudentSkill);
  }

  async getMySkills(userId: number) {
    const profile = await this.profilesService.findByUserId(userId);

    return this.studentSkillsRepository.find({
      where: { student_id: profile.id },
      relations: ['skill'],
    });
  }

  async updateSkillLevel(
    userId: number,
    id: number,
    updateDto: UpdateStudentSkillDto,
  ) {
    const profile = await this.profilesService.findByUserId(userId);

    const studentSkill = await this.studentSkillsRepository.findOne({
      where: { id },
    });
    if (!studentSkill) {
      throw new NotFoundException('Skill entry not found');
    }

    if (studentSkill.student_id !== profile.id) {
      throw new ForbiddenException(
        'You do not have permission to modify this skill',
      );
    }

    studentSkill.nivel = updateDto.nivel;
    return this.studentSkillsRepository.save(studentSkill);
  }

  async removeSkill(userId: number, id: number) {
    const profile = await this.profilesService.findByUserId(userId);

    const studentSkill = await this.studentSkillsRepository.findOne({
      where: { id },
    });
    if (!studentSkill) {
      throw new NotFoundException('Skill entry not found');
    }

    if (studentSkill.student_id !== profile.id) {
      throw new ForbiddenException(
        'You do not have permission to delete this skill',
      );
    }

    await this.studentSkillsRepository.delete(id);
    return { message: 'Skill removed successfully' };
  }
}
