import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, Index } from 'typeorm';
import { Profile } from '../../profiles/entities/profile.entity';
import { Skill } from './skill.entity';

export enum SkillLevel {
  BASIC = 'Básico',
  INTERMEDIO = 'Intermedio',
  AVANZADO = 'Avanzado',
}

@Entity('student_skills')
@Index(['profileId', 'skillId'], { unique: true })
export class StudentSkill {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: SkillLevel,
  })
  nivel: SkillLevel;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relationships
  @ManyToOne(() => Profile, (profile) => profile.studentSkills, { onDelete: 'CASCADE' })
  profile: Profile;

  @Index()
  @Column()
  profileId: string;

  @ManyToOne(() => Skill, (skill) => skill.studentSkills, { onDelete: 'CASCADE' })
  skill: Skill;

  @Index()
  @Column()
  skillId: string;
}
