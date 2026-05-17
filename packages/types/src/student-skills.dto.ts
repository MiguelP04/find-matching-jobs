import { IsEnum, IsNumber } from 'class-validator';

export enum NivelSkill {
  BASICO = 'Básico',
  INTERMEDIO = 'Intermedio',
  AVANZADO = 'Avanzado',
}

export class CreateStudentSkillDto {
  @IsNumber()
  skill_id!: number;

  @IsEnum(NivelSkill)
  nivel!: NivelSkill;
}

export class UpdateStudentSkillDto {
  @IsEnum(NivelSkill)
  nivel!: NivelSkill;
}
