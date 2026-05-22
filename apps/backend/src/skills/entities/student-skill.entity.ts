import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  Index,
  JoinColumn,
} from 'typeorm';
import { Profile } from '../../profiles/entities/profile.entity';
import { Skill } from './skill.entity';

export enum NivelSkill {
  BASICO = 'Básico',
  INTERMEDIO = 'Intermedio',
  AVANZADO = 'Avanzado',
}

@Entity('student_skills')
@Index(['student_id', 'skill_id'], { unique: true })
export class StudentSkill {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @Column()
  student_id: number;

  @Index()
  @Column()
  skill_id: number;

  @Column({
    type: 'enum',
    enum: NivelSkill,
  })
  nivel: NivelSkill;

  @ManyToOne(() => Profile, (profile) => profile.studentSkills)
  @JoinColumn({ name: 'student_id' })
  student: Profile;

  @ManyToOne(() => Skill, (skill) => skill.studentSkills)
  @JoinColumn({ name: 'skill_id' })
  skill: Skill;
}
