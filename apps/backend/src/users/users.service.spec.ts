import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsersService } from './users.service';
import { User, UserRole } from './entities/user.entity';
import { NotFoundException, ForbiddenException } from '@nestjs/common';

const mockUser: User = {
  id: 1,
  nombre: 'Juan',
  apellido: 'Pérez',
  email: 'juan@test.com',
  password: 'hashed_password',
  rol: UserRole.ESTUDIANTE,
  profile: null as any,
};

describe('UsersService', () => {
  let service: UsersService;
  let repo: Repository<User>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: {
            create: jest.fn().mockReturnValue(mockUser),
            save: jest.fn().mockResolvedValue(mockUser),
            findOne: jest.fn().mockResolvedValue(mockUser),
            find: jest.fn().mockResolvedValue([mockUser]),
            remove: jest.fn().mockResolvedValue(undefined),
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repo = module.get<Repository<User>>(getRepositoryToken(User));
  });

  describe('create', () => {
    it('debe crear un usuario', async () => {
      const result = await service.create({ nombre: 'Juan', email: 'juan@test.com' });
      expect(result).toEqual(mockUser);
      expect(repo.create).toHaveBeenCalled();
      expect(repo.save).toHaveBeenCalled();
    });
  });

  describe('findOneByEmail', () => {
    it('debe retornar un usuario por email', async () => {
      const result = await service.findOneByEmail('juan@test.com');
      expect(result).toEqual(mockUser);
      expect(repo.findOne).toHaveBeenCalledWith({ where: { email: 'juan@test.com' } });
    });

    it('debe retornar null si no existe', async () => {
      jest.spyOn(repo, 'findOne').mockResolvedValue(null);
      const result = await service.findOneByEmail('noexiste@test.com');
      expect(result).toBeNull();
    });
  });

  describe('findOneById', () => {
    it('debe retornar un usuario por id', async () => {
      const result = await service.findOneById(1);
      expect(result).toEqual(mockUser);
      expect(repo.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
    });

    it('debe lanzar NotFoundException si no existe', async () => {
      jest.spyOn(repo, 'findOne').mockResolvedValue(null);
      await expect(service.findOneById(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAll', () => {
    it('debe retornar todos los usuarios', async () => {
      const result = await service.findAll();
      expect(result).toEqual([mockUser]);
      expect(repo.find).toHaveBeenCalledWith({
        select: ['id', 'nombre', 'apellido', 'email', 'rol'],
      });
    });
  });

  describe('update', () => {
    it('debe actualizar el propio usuario', async () => {
      const result = await service.update(1, { nombre: 'Juan Updated' }, 1, UserRole.ESTUDIANTE);
      expect(result).toEqual(mockUser);
      expect(repo.save).toHaveBeenCalled();
    });

    it('debe lanzar ForbiddenException si no es owner ni admin', async () => {
      await expect(
        service.update(1, { nombre: 'Hack' }, 2, UserRole.ESTUDIANTE),
      ).rejects.toThrow(ForbiddenException);
    });

    it('admin debe poder actualizar cualquier usuario', async () => {
      const result = await service.update(1, { nombre: 'Admin Update' }, 2, UserRole.ADMIN);
      expect(result).toEqual(mockUser);
    });

    it('debe ignorar el campo password si se envía', async () => {
      const saveSpy = jest.spyOn(repo, 'save');
      await service.update(1, { nombre: 'Test', password: 'nuevopass' }, 1, UserRole.ESTUDIANTE);
      const savedUser = saveSpy.mock.calls[0][0] as User;
      expect(savedUser.password).toBe('hashed_password');
    });

    it('debe ignorar el campo rol si no es admin', async () => {
      const saveSpy = jest.spyOn(repo, 'save');
      await service.update(1, { nombre: 'Test', rol: UserRole.ADMIN }, 1, UserRole.ESTUDIANTE);
      const savedUser = saveSpy.mock.calls[0][0] as User;
      expect(savedUser.rol).toBe(UserRole.ESTUDIANTE);
    });
  });

  describe('delete', () => {
    it('debe eliminar un usuario', async () => {
      await service.delete(1);
      expect(repo.remove).toHaveBeenCalledWith(mockUser);
    });

    it('debe lanzar NotFoundException si no existe', async () => {
      jest.spyOn(repo, 'findOne').mockResolvedValue(null);
      await expect(service.delete(999)).rejects.toThrow(NotFoundException);
    });
  });
});
