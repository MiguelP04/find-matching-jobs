import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  Index,
} from 'typeorm';
import { MatchResult } from '../../matching/entities/match-result.entity';

@Entity('jobs')
export class Job {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  external_id: string;

  @Index()
  @Column()
  titulo: string;

  @Index()
  @Column()
  empresa: string;

  @Column({ type: 'text' })
  descripcion: string;

  @Index()
  @Column()
  ubicacion: string;

  @Column()
  url_postulacion: string;

  @Column()
  fecha_publicacion: Date;

  @OneToMany(() => MatchResult, (matchResult) => matchResult.job)
  matchResults: MatchResult[];
}
