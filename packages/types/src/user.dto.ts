import {
  IsOptional,
  IsString,
  IsEmail,
  IsEnum,
  IsNotEmpty,
} from "class-validator";
import { UserRole } from "./auth.dto";

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  nombre!: string;

  @IsString()
  @IsNotEmpty()
  apellido!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @IsNotEmpty()
  password!: string;

  @IsEnum(UserRole)
  rol!: UserRole;
}

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  nombre?: string;

  @IsOptional()
  @IsString()
  apellido?: string;

  @IsOptional()
  @IsEmail()
  email?: string;
}

export class UserResponseDto {
  id!: string;
  nombre!: string;
  apellido!: string;
  email!: string;
  rol!: UserRole;
  createdAt!: Date;
  updatedAt!: Date;
}
