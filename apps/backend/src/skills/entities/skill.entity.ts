import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { StudentSkill } from './student-skill.entity';

@Entity('skills')
export class Skill {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  nombre: string;

  @OneToMany(() => StudentSkill, (studentSkill) => studentSkill.skill)
  studentSkills: StudentSkill[];
}
