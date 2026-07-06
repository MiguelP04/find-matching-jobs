import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StudentSkill } from './entities/student-skill.entity';
import { Skill } from './entities/skill.entity';
import { ProfilesService } from '../profiles/profiles.service';
import { MatchingService } from '../matching/matching.service';
import {
  CreateStudentSkillDto,
  UpdateStudentSkillDto,
} from '@find-matching-jobs/types';

@Injectable()
export class StudentSkillsService {
  private readonly logger = new Logger(StudentSkillsService.name);

  constructor(
    @InjectRepository(StudentSkill)
    private readonly studentSkillsRepository: Repository<StudentSkill>,
    @InjectRepository(Skill)
    private readonly skillsRepository: Repository<Skill>,
    private readonly profilesService: ProfilesService,
    private readonly matchingService: MatchingService,
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

    const saved = await this.studentSkillsRepository.save(newStudentSkill);

    this.matchingService
      .matchStudentToAllJobs(userId, { useAI: true })
      .catch((err: Error) =>
        this.logger.error(
          `Background matching error after addSkill: ${err.message}`,
        ),
      );

    return saved;
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
    const saved = await this.studentSkillsRepository.save(studentSkill);

    this.matchingService
      .matchStudentToAllJobs(userId, { useAI: true })
      .catch((err: Error) =>
        this.logger.error(
          `Background matching error after updateSkill: ${err.message}`,
        ),
      );

    return saved;
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

    const remaining = await this.studentSkillsRepository.count({
      where: { student_id: profile.id },
    });

    if (remaining > 0) {
      this.matchingService
        .matchStudentToAllJobs(userId, { useAI: true })
        .catch((err: Error) =>
          this.logger.error(
            `Background matching error after removeSkill: ${err.message}`,
          ),
        );
    }

    return { message: 'Skill removed successfully' };
  }
}
