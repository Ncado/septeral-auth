import { Test, TestingModule } from '@nestjs/testing';
import { PasswordService } from '../../../utils/password.service';
import { bcryptConfig } from '../../../config/bcrypt.config';

describe('PasswordService', () => {
  let service: PasswordService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PasswordService,
        {
          provide: bcryptConfig.KEY,
          useValue: { saltRounds: 10 },
        },
      ],
    }).compile();

    service = module.get<PasswordService>(PasswordService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('hashPassword', () => {
    it('should hash a password', async () => {
      const password = 'testPassword';
      const hashedPassword = await service.hashPassword(password);

      expect(hashedPassword).toBeDefined();
      expect(hashedPassword).not.toEqual(password);
    });
  });

  describe('comparePassword', () => {
    it('should return true for matching passwords', async () => {
      const password = 'testPassword';
      const hashedPassword = await service.hashPassword(password);
      const isMatch = await service.comparePassword(password, hashedPassword);

      expect(isMatch).toBe(true);
    });

    it('should return false for non-matching passwords', async () => {
      const password1 = 'testPassword1';
      const password2 = 'testPassword2';
      const hashedPassword = await service.hashPassword(password1);
      const isMatch = await service.comparePassword(password2, hashedPassword);

      expect(isMatch).toBe(false);
    });
  });
});
