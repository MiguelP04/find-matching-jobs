import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProfilesService } from './profiles.service';
import { Profile, Modalidad } from './entities/profile.entity';
import { ConflictException, NotFoundException } from '@nestjs/common';

const mockProfile: Profile = {
  id: 1,
  user_id: 1,
  resumen_profesional: 'Desarrollador backend',
  semestre: 6,
  modalidad_preferida: Modalidad.REMOTO,
  github_url: 'https://github.com/test',
  linkedin_url: 'https://linkedin.com/in/test',
  user: null as any,
  studentSkills: [],
  matchResults: [],
};

describe('ProfilesService', () => {
  let service: ProfilesService;
  let repo: Repository<Profile>;

  let findOneMock: jest.Mock;

  beforeEach(async () => {
    findOneMock = jest.fn();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProfilesService,
        {
          provide: getRepositoryToken(Profile),
          useValue: {
            create: jest.fn().mockReturnValue(mockProfile),
            save: jest.fn().mockResolvedValue(mockProfile),
            findOne: findOneMock,
          },
        },
      ],
    }).compile();

    service = module.get<ProfilesService>(ProfilesService);
    repo = module.get<Repository<Profile>>(getRepositoryToken(Profile));
  });

  afterEach(() => jest.clearAllMocks());

  describe('create', () => {
    it('debe crear un perfil', async () => {
      findOneMock.mockResolvedValue(null);
      const dto = { resumen_profesional: 'Dev', semestre: 6 };
      const result = await service.create(1, dto as any);
      expect(result).toEqual(mockProfile);
      expect(repo.create).toHaveBeenCalledWith({ ...dto, user_id: 1 });
      expect(repo.save).toHaveBeenCalled();
    });

    it('debe lanzar ConflictException si ya existe un perfil', async () => {
      findOneMock.mockResolvedValue(mockProfile);
      await expect(service.create(1, {} as any)).rejects.toThrow(ConflictException);
    });
  });

  describe('findByUserId', () => {
    it('debe retornar el perfil por user_id', async () => {
      findOneMock.mockResolvedValue(mockProfile);
      const result = await service.findByUserId(1);
      expect(result).toEqual(mockProfile);
      expect(findOneMock).toHaveBeenCalledWith({
        where: { user_id: 1 },
        relations: ['user'],
      });
    });

    it('debe lanzar NotFoundException si no existe', async () => {
      findOneMock.mockResolvedValue(null);
      await expect(service.findByUserId(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('debe actualizar el perfil', async () => {
      findOneMock.mockResolvedValue(mockProfile);
      const dto = { resumen_profesional: 'Updated', semestre: 8 };
      const result = await service.update(1, dto as any);
      expect(result).toEqual(mockProfile);
      expect(repo.save).toHaveBeenCalled();
    });
  });
});
