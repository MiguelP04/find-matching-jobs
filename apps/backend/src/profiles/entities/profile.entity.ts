import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { StudentSkill } from '../../skills/entities/student-skill.entity';
import { MatchResult } from '../../matching/entities/match-result.entity';

@Entity('profiles')
export class Profile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text', nullable: true })
  bio: string;

  @Column({ nullable: true })
  avatarUrl: string;

  @Column({ nullable: true })
  telefono: string;

  @Column({ nullable: true })
  ubicacion: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relationships
  @OneToOne(() => User, (user) => user.profile)
  user: User;

  @OneToMany(() => StudentSkill, (studentSkill) => studentSkill.profile, { cascade: true })
  studentSkills: StudentSkill[];

  @OneToMany(() => MatchResult, (matchResult) => matchResult.profile)
  matchResults: MatchResult[];
}
