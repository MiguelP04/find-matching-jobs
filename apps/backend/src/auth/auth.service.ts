import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { RegisterDto, LoginDto } from '@find-matching-jobs/types';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) { }

  async register(registerDto: RegisterDto) {
    const userExists = await this.usersService.findOneByEmail(registerDto.email);
    if (userExists) {
      throw new BadRequestException('El correo ya está registrado');
    }

    // Hashear contraseña
    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    // Crear usuario (aquí llamas a tu UsersService que interactúa con TypeORM)
    const user = await this.usersService.create({
      ...registerDto,
      password: hashedPassword,
    });

    return { message: 'Usuario registrado con éxito', userId: user.id };
  }

  async login(loginDto: LoginDto) {
    const user = await this.usersService.findOneByEmail(loginDto.email);
    if (!user) throw new UnauthorizedException('Credenciales inválidas');

    if (!user.password) throw new UnauthorizedException('Credenciales inválidas');

    const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);
    if (!isPasswordValid) throw new UnauthorizedException('Credenciales inválidas');

    // Generar JWT
    const payload = {
      sub: user.id,
      email: user.email,
      rol: user.rol,
      nombre: user.nombre,
      apellido: user.apellido,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        nombre: user.nombre,
        apellido: user.apellido,
        email: user.email,
        rol: user.rol,
      },
    };
  }

  async loginWithGoogle(googleProfile: {
    googleId: string;
    email: string;
    nombre: string;
    apellido: string;
    avatar?: string;
  }) {
    let user = await this.usersService.findOneByGoogleId(googleProfile.googleId)
      ?? await this.usersService.findOneByEmail(googleProfile.email);

    if (user) {
      if (!user.googleId) {
        await this.usersService.update(user.id, {
          googleId: googleProfile.googleId,
          avatar: googleProfile.avatar,
        }, user.id, user.rol);
      }
    } else {
      user = await this.usersService.create({
        googleId: googleProfile.googleId,
        email: googleProfile.email,
        nombre: googleProfile.nombre,
        apellido: googleProfile.apellido,
        avatar: googleProfile.avatar,
      });
    }

    const payload = {
      sub: user.id,
      email: user.email,
      rol: user.rol,
      nombre: user.nombre,
      apellido: user.apellido,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        nombre: user.nombre,
        apellido: user.apellido,
        email: user.email,
        rol: user.rol,
      },
    };
  }
}