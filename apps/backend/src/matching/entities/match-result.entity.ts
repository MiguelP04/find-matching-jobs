import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, Index, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Profile } from '../../profiles/entities/profile.entity';
import { Job } from '../../jobs/entities/job.entity';

@Entity('match_results')
@Index(['profileId', 'jobId'], { unique: true })
export class MatchResult {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'float' })
  porcentajeMatch: number;

  @Column({ type: 'text', nullable: true })
  razonamiento: string;

  @Column({ default: false })
  postulado: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relationships
  @ManyToOne(() => Profile, (profile) => profile.matchResults, { onDelete: 'CASCADE' })
  profile: Profile;

  @Index()
  @Column()
  profileId: string;

  @ManyToOne(() => Job, (job) => job.matchResults, { onDelete: 'CASCADE' })
  job: Job;

  @Index()
  @Column()
  jobId: string;
}
