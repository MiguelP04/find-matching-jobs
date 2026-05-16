import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt', () => ({
  hash: jest.fn().mockResolvedValue('hashed_password_123'),
  compare: jest.fn(),
}));

const mockUsersService = {
  findOneByEmail: jest.fn(),
  create: jest.fn(),
};

const mockJwtService = {
  sign: jest.fn().mockReturnValue('jwt_token_123'),
};

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: mockUsersService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jest.clearAllMocks();
  });

  describe('register', () => {
    const registerDto = { nombre: 'Juan', apellido: 'Pérez', email: 'juan@test.com', password: '123456' };

    it('debe registrar un nuevo usuario', async () => {
      mockUsersService.findOneByEmail.mockResolvedValue(null);
      mockUsersService.create.mockResolvedValue({ id: 1 });

      const result = await service.register(registerDto as any);

      expect(result).toEqual({ message: 'Usuario registrado con éxito', userId: 1 });
      expect(mockUsersService.create).toHaveBeenCalledWith({
        ...registerDto,
        password: 'hashed_password_123',
      });
    });

    it('debe lanzar BadRequestException si el email ya existe', async () => {
      mockUsersService.findOneByEmail.mockResolvedValue({ id: 1 });

      await expect(service.register(registerDto as any)).rejects.toThrow(BadRequestException);
    });

    it('debe hashear la contraseña con bcrypt', async () => {
      mockUsersService.findOneByEmail.mockResolvedValue(null);
      mockUsersService.create.mockResolvedValue({ id: 1 });

      await service.register(registerDto as any);

      expect(bcrypt.hash).toHaveBeenCalledWith('123456', 10);
    });
  });

  describe('login', () => {
    const loginDto = { email: 'juan@test.com', password: '123456' };
    const mockUser = {
      id: 1,
      nombre: 'Juan',
      email: 'juan@test.com',
      password: 'hashed_password_123',
      rol: 'estudiante',
    };

    it('debe retornar access_token y datos del usuario', async () => {
      mockUsersService.findOneByEmail.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.login(loginDto as any);

      expect(result).toEqual({
        access_token: 'jwt_token_123',
        user: { id: 1, nombre: 'Juan', email: 'juan@test.com', rol: 'estudiante' },
      });
      expect(mockJwtService.sign).toHaveBeenCalledWith({
        sub: 1,
        email: 'juan@test.com',
        rol: 'estudiante',
      });
    });

    it('debe lanzar UnauthorizedException si el email no existe', async () => {
      mockUsersService.findOneByEmail.mockResolvedValue(null);

      await expect(service.login(loginDto as any)).rejects.toThrow(UnauthorizedException);
    });

    it('debe lanzar UnauthorizedException si la contraseña es incorrecta', async () => {
      mockUsersService.findOneByEmail.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.login(loginDto as any)).rejects.toThrow(UnauthorizedException);
    });
  });
});
