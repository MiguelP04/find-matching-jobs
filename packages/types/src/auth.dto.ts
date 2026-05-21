import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  IsEnum,
  IsOptional,
} from "class-validator";

export enum UserRole {
  ESTUDIANTE = "estudiante",
  ADMIN = "admin",
}

export class RegisterDto {
  @IsNotEmpty({ message: "El nombre no puede estar vacío" })
  @IsString()
  nombre!: string;

  @IsNotEmpty({ message: "El apellido no puede estar vacío" })
  @IsString()
  apellido!: string;

  @IsEmail({}, { message: "El email debe ser válido" })
  email!: string;

  @IsNotEmpty({ message: "La contraseña no puede estar vacía" })
  @IsString()
  @MinLength(6, { message: "La contraseña debe tener al menos 6 caracteres" })
  password!: string;

  @IsOptional()
  @IsEnum(UserRole)
  rol?: UserRole = UserRole.ESTUDIANTE;
}

export class LoginDto {
  @IsEmail({}, { message: "El email debe ser válido" })
  email!: string;

  @IsNotEmpty({ message: "La contraseña no puede estar vacía" })
  @IsString()
  password!: string;
}

export class AuthResponseDto {
  access_token!: string;
  user!: {
    id: string;
    email: string;
    nombre: string;
    apellido: string;
    rol: UserRole;
  };
}
