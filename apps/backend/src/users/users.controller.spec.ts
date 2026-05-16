import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { UserRole } from './entities/user.entity';
import { ForbiddenException } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';

const mockUser = {
  id: 1,
  nombre: 'Juan',
  apellido: 'Pérez',
  email: 'juan@test.com',
  rol: UserRole.ESTUDIANTE,
};

const mockUsersService = {
  findAll: jest.fn().mockResolvedValue([mockUser]),
  findOneById: jest.fn().mockResolvedValue(mockUser),
  update: jest.fn().mockResolvedValue(mockUser),
  delete: jest.fn().mockResolvedValue(undefined),
};

describe('UsersController', () => {
  let controller: UsersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: jest.fn().mockReturnValue(true) })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: jest.fn().mockReturnValue(true) })
      .compile();

    controller = module.get<UsersController>(UsersController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /users', () => {
    it('debe retornar lista de usuarios (admin)', async () => {
      const result = await controller.findAll();
      expect(result).toEqual([mockUser]);
      expect(mockUsersService.findAll).toHaveBeenCalled();
    });
  });

  describe('GET /users/:id', () => {
    it('debe retornar el propio perfil del usuario', async () => {
      const req = { user: { userId: 1, email: 'juan@test.com', rol: UserRole.ESTUDIANTE } };
      const result = await controller.findOne('1', req as any);
      expect(result).toEqual(mockUser);
      expect(mockUsersService.findOneById).toHaveBeenCalledWith(1);
    });

    it('debe lanzar ForbiddenException si no es owner ni admin', async () => {
      const req = { user: { userId: 2, email: 'otro@test.com', rol: UserRole.ESTUDIANTE } };
      expect(() => controller.findOne('1', req as any)).toThrow(ForbiddenException);
    });

    it('admin debe poder ver cualquier perfil', async () => {
      const req = { user: { userId: 5, email: 'admin@test.com', rol: UserRole.ADMIN } };
      const result = await controller.findOne('1', req as any);
      expect(result).toEqual(mockUser);
    });
  });

  describe('PATCH /users/:id', () => {
    it('debe actualizar el propio perfil', async () => {
      const req = { user: { userId: 1, email: 'juan@test.com', rol: UserRole.ESTUDIANTE } };
      const dto = { nombre: 'Juan Updated' };
      const result = await controller.update('1', dto, req as any);
      expect(result).toEqual(mockUser);
      expect(mockUsersService.update).toHaveBeenCalledWith(1, dto, 1, UserRole.ESTUDIANTE);
    });
  });

  describe('DELETE /users/:id', () => {
    it('debe eliminar un usuario (admin)', async () => {
      await controller.delete('1');
      expect(mockUsersService.delete).toHaveBeenCalledWith(1);
    });
  });
});
