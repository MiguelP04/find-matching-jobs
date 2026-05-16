import { Test, TestingModule } from '@nestjs/testing';
import { ProfilesController } from './profiles.controller';
import { ProfilesService } from './profiles.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UserRole } from '../users/entities/user.entity';
import { Modalidad } from './entities/profile.entity';

const mockProfile = {
  id: 1,
  user_id: 1,
  resumen_profesional: 'Desarrollador backend',
  semestre: 6,
  modalidad_preferida: Modalidad.REMOTO,
  github_url: 'https://github.com/test',
  linkedin_url: 'https://linkedin.com/in/test',
};

const mockProfilesService = {
  create: jest.fn().mockResolvedValue(mockProfile),
  findByUserId: jest.fn().mockResolvedValue(mockProfile),
  update: jest.fn().mockResolvedValue(mockProfile),
};

describe('ProfilesController', () => {
  let controller: ProfilesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProfilesController],
      providers: [
        { provide: ProfilesService, useValue: mockProfilesService },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: jest.fn().mockReturnValue(true) })
      .compile();

    controller = module.get<ProfilesController>(ProfilesController);
    jest.clearAllMocks();
  });

  const mockReq = { user: { userId: 1, email: 'test@test.com', rol: UserRole.ESTUDIANTE } };

  describe('POST /profiles', () => {
    it('debe crear un perfil', async () => {
      const dto = { resumen_profesional: 'Dev', semestre: 6 };
      const result = await controller.create(dto as any, mockReq as any);
      expect(result).toEqual(mockProfile);
      expect(mockProfilesService.create).toHaveBeenCalledWith(1, dto);
    });
  });

  describe('GET /profiles/me', () => {
    it('debe retornar el perfil del usuario autenticado', async () => {
      const result = await controller.findMe(mockReq as any);
      expect(result).toEqual(mockProfile);
      expect(mockProfilesService.findByUserId).toHaveBeenCalledWith(1);
    });
  });

  describe('PATCH /profiles/me', () => {
    it('debe actualizar el perfil del usuario autenticado', async () => {
      const dto = { resumen_profesional: 'Updated' };
      const result = await controller.update(dto as any, mockReq as any);
      expect(result).toEqual(mockProfile);
      expect(mockProfilesService.update).toHaveBeenCalledWith(1, dto);
    });
  });
});
