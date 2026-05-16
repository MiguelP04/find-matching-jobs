import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn } from 'typeorm'
import { Profile } from '../../profiles/entities/profile.entity'
import { Exclude } from 'class-transformer'

export enum UserRole {
  ESTUDIANTE = 'estudiante',
  ADMIN = 'admin',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id!: number

  @Column({ length: 100 })
  nombre!: string

  @Column({ length: 100 })
  apellido!: string

  @Column({ unique: true })
  email!: string

  @Column()
  @Exclude()
  password!: string

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.ESTUDIANTE,
  })
  rol!: UserRole

  @OneToOne(() => Profile, (profile) => profile.user, { cascade: true })
  @JoinColumn()
  profile!: Profile
}
