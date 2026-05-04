import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index, OneToMany } from 'typeorm';
import { MatchResult } from '../../matching/entities/match-result.entity';

@Entity('jobs')
export class Job {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  titulo: string;

  @Column({ type: 'text' })
  descripcion: string;

  @Column()
  empresa: string;

  @Column({ nullable: true })
  ubicacion: string;

  @Column('simple-array', { nullable: true })
  requisitos: string[];

  @Column('simple-array', { nullable: true })
  habilidadesRequeridas: string[];

  @Column({ nullable: true })
  salario: string;

  @Column({ nullable: true })
  tipoContrato: string;

  @Column({ default: true })
  activo: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relationships
  @OneToMany(() => MatchResult, (matchResult) => matchResult.job)
  matchResults: MatchResult[];
}
