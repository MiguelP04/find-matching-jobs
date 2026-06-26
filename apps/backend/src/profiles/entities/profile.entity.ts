import { Entity, PrimaryGeneratedColumn, Column, OneToOne, OneToMany, JoinColumn } from 'typeorm'
import { User } from '../../users/entities/user.entity'
import { StudentSkill } from '../../skills/entities/student-skill.entity'
import { MatchResult } from '../../matching/entities/match-result.entity'
import { Modalidad } from '@find-matching-jobs/types'

@Entity('profiles')
export class Profile {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ unique: true })
  user_id: number

  @Column({ type: 'text', nullable: true })
  resumen_profesional: string

  @Column({ nullable: true })
  semestre: number

  @Column({
    type: 'enum',
    enum: Modalidad,
    nullable: true,
  })
  modalidad_preferida: Modalidad

  @Column({ nullable: true })
  github_url: string

  @Column({ nullable: true })
  linkedin_url: string

  @OneToOne(() => User, (user) => user.profile, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User

  @OneToMany(() => StudentSkill, (studentSkill) => studentSkill.student, { cascade: true })
  studentSkills: StudentSkill[]

  @OneToMany(() => MatchResult, (matchResult) => matchResult.student)
  matchResults: MatchResult[]
}
