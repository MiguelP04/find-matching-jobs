import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

const mockAuthService = {
  register: jest.fn().mockResolvedValue({ message: 'Usuario registrado con éxito', userId: 1 }),
  login: jest.fn().mockResolvedValue({ access_token: 'jwt_token', user: { id: 1, email: 'test@test.com' } }),
  loginWithGoogle: jest.fn().mockResolvedValue({ access_token: 'google_jwt_token', user: { id: 1, email: 'test@gmail.com' } }),
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

  describe('GET /auth/google/callback', () => {
    it('debe redirigir al frontend con el token', async () => {
      const mockReq = { user: { googleId: '123', email: 'test@gmail.com' } };
      const mockRes = { redirect: jest.fn() };

      await controller.googleAuthRedirect(mockReq as any, mockRes as any);

      expect(mockAuthService.loginWithGoogle).toHaveBeenCalledWith(mockReq.user);
      expect(mockRes.redirect).toHaveBeenCalledWith(
        `${process.env.FRONTEND_URL}/auth/callback?token=google_jwt_token`,
      );
    });
  });
});
