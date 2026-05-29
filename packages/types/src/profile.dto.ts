import { IsOptional, IsString, IsInt, IsEnum, IsUrl, Min, Max } from 'class-validator';

export enum Modalidad {
  REMOTO = 'remoto',
  PRESENCIAL = 'presencial',
  HIBRIDO = 'hibrido',
}

export class CreateProfileDto {
  @IsOptional()
  @IsString()
  resumen_profesional?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(14)
  semestre?: number;

  @IsOptional()
  @IsEnum(Modalidad)
  modalidad_preferida?: Modalidad;

  @IsOptional()
  @IsUrl()
  github_url?: string;

  @IsOptional()
  @IsUrl()
  linkedin_url?: string;
}

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  resumen_profesional?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(14)
  semestre?: number;

  @IsOptional()
  @IsEnum(Modalidad)
  modalidad_preferida?: Modalidad;

  @IsOptional()
  @IsUrl()
  github_url?: string;

  @IsOptional()
  @IsUrl()
  linkedin_url?: string;
}
