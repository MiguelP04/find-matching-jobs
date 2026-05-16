import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

const mockAuthService = {
  register: jest.fn().mockResolvedValue({ message: 'Usuario registrado con éxito', userId: 1 }),
  login: jest.fn().mockResolvedValue({ access_token: 'jwt_token', user: { id: 1, email: 'test@test.com' } }),
};

describe('AuthController', () => {
  let controller: AuthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  describe('POST /auth/register', () => {
    it('debe llamar a AuthService.register con los datos correctos', async () => {
      const dto = { nombre: 'Juan', apellido: 'Pérez', email: 'juan@test.com', password: '123456' };
      const result = await controller.register(dto as any);

      expect(result).toEqual({ message: 'Usuario registrado con éxito', userId: 1 });
      expect(mockAuthService.register).toHaveBeenCalledWith(dto);
    });
  });

  describe('POST /auth/login', () => {
    it('debe llamar a AuthService.login con los datos correctos', async () => {
      const dto = { email: 'juan@test.com', password: '123456' };
      const result = await controller.login(dto as any);

      expect(result).toEqual({ access_token: 'jwt_token', user: { id: 1, email: 'test@test.com' } });
      expect(mockAuthService.login).toHaveBeenCalledWith(dto);
    });
  });
});
