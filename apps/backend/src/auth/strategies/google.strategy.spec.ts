import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { GoogleStrategy } from './google.strategy';

const mockConfigService = {
  getOrThrow: jest.fn((key: string) => {
    const config = {
      GOOGLE_CLIENT_ID: 'test-client-id',
      GOOGLE_CLIENT_SECRET: 'test-client-secret',
      GOOGLE_CALLBACK_URL: 'http://localhost:3000/auth/google/callback',
    };
    return config[key];
  }),
};

describe('GoogleStrategy', () => {
  let strategy: GoogleStrategy;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GoogleStrategy,
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    strategy = module.get<GoogleStrategy>(GoogleStrategy);
  });

  describe('validate', () => {
    it('debe extraer los datos del perfil de Google correctamente', async () => {
      const mockProfile = {
        id: 'google-id-123',
        name: { givenName: 'Juan', familyName: 'Pérez' },
        emails: [{ value: 'juan@gmail.com' }],
        photos: [{ value: 'https://avatar.com/photo.jpg' }],
      };
      const done = jest.fn();

      await strategy.validate('access-token', 'refresh-token', mockProfile, done);

      expect(done).toHaveBeenCalledWith(null, {
        googleId: 'google-id-123',
        email: 'juan@gmail.com',
        nombre: 'Juan',
        apellido: 'Pérez',
        avatar: 'https://avatar.com/photo.jpg',
      });
    });

    it('debe manejar perfil sin foto', async () => {
      const mockProfile = {
        id: 'google-id-456',
        name: { givenName: 'Ana', familyName: 'López' },
        emails: [{ value: 'ana@gmail.com' }],
        photos: [],
      };
      const done = jest.fn();

      await strategy.validate('access-token', 'refresh-token', mockProfile, done);

      expect(done).toHaveBeenCalledWith(null, {
        googleId: 'google-id-456',
        email: 'ana@gmail.com',
        nombre: 'Ana',
        apellido: 'López',
        avatar: undefined,
      });
    });
  });
});
