import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, Index, JoinColumn } from 'typeorm'
import { Profile } from '../../profiles/entities/profile.entity'
import { Job } from '../../jobs/entities/job.entity'

@Entity('match_results')
export class MatchResult {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  score: number

  @Column({ type: 'text' })
  justificacion_ia: string

  @Column({ type: 'simple-array', nullable: true })
  missing_skills: string[]

  @Column()
  fecha_analisis: Date

  @Index()
  @Column()
  student_id: number

  @Index()
  @Column()
  job_id: number

  @ManyToOne(() => Profile)
  @JoinColumn({ name: 'student_id' })
  student: Profile

  @ManyToOne(() => Job, (job) => job.matchResults)
  @JoinColumn({ name: 'job_id' })
  job: Job
}
