import { JwtService } from '@nestjs/jwt';
import { BadRequestException, Logger } from '@nestjs/common';
import { AuthService } from '../../../auth/auth.service';
import { UsersService } from '../../../users/users.service';
import { Test, TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';
import { LoginDto } from '../../../auth/dto/login.dto';

jest.mock('bcrypt');

describe('AuthService', () => {
  let authService: AuthService;
  let usersServiceMock: {
    getUserByEmail: jest.Mock;
    createGUser: jest.Mock;
  };
  let jwtServiceMock: {
    verify: jest.Mock;
    sign: jest.Mock;
  };

  beforeEach(async () => {
    usersServiceMock = {
      getUserByEmail: jest.fn(),
      createGUser: jest.fn(),
    };

    jwtServiceMock = {
      verify: jest.fn(),
      sign: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: usersServiceMock,
        },
        {
          provide: JwtService,
          useValue: jwtServiceMock,
        },
        Logger,
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(authService).toBeDefined();
  });

  describe('validate', () => {
    it('should return null for non-existing user', async () => {
      usersServiceMock.getUserByEmail.mockResolvedValue(null);

      const result = await authService.validate(
        'nonexistent@example.com',
        'password',
      );

      expect(result).toBeNull();
      expect(usersServiceMock.getUserByEmail).toHaveBeenCalledWith(
        'nonexistent@example.com',
      );
    });

    it('should throw BadRequestException for wrong credentials', async () => {
      const user = { email: 'test@example.com', password: 'hashedPassword' };
      usersServiceMock.getUserByEmail.mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        authService.validate('test@example.com', 'wrongPassword'),
      ).rejects.toThrowError(BadRequestException);
    });

    it('should return user for valid credentials', async () => {
      const user = { email: 'test@example.com', password: 'hashedPassword' };
      usersServiceMock.getUserByEmail.mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await authService.validate(
        'test@example.com',
        'correctPassword',
      );

      expect(result).toEqual(user);
    });
  });

  describe('login', () => {
    it('should throw BadRequestException for user not found', async () => {
      usersServiceMock.getUserByEmail.mockResolvedValue(null);

      await expect(
        authService.login({ email: 'nonexistent@example.com' } as LoginDto),
      ).rejects.toThrowError(BadRequestException);
    });

    it('should return access token and user for valid login', async () => {
      const user = { email: 'test@example.com', id: 1 };
      usersServiceMock.getUserByEmail.mockResolvedValue(user);
      jwtServiceMock.sign.mockReturnValue('accessToken');

      const result = await authService.login({
        email: 'test@example.com',
      } as LoginDto);

      expect(result).toEqual({ access_token: 'accessToken', user });
    });
  });

  describe('verify', () => {
    it('should throw BadRequestException for invalid token', async () => {
      jwtServiceMock.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      await expect(authService.verify('invalidToken')).rejects.toThrowError(
        BadRequestException,
      );
    });

    it('should throw BadRequestException for user not found', async () => {
      jwtServiceMock.verify.mockReturnValue({
        email: 'nonexistent@example.com',
      });
      usersServiceMock.getUserByEmail.mockResolvedValue(null);

      await expect(authService.verify('validToken')).rejects.toThrowError(
        BadRequestException,
      );
    });

    it('should return user for valid token', async () => {
      const user = { email: 'test@example.com', id: 1 };
      jwtServiceMock.verify.mockReturnValue({ email: 'test@example.com' });
      usersServiceMock.getUserByEmail.mockResolvedValue(user);

      const result = await authService.verify('validToken');

      expect(result).toEqual(user);
    });
  });

  describe('issueToken', () => {
    it('should return signed token', () => {
      const payload = { email: 'test@example.com', sub: 1 };
      jwtServiceMock.sign.mockReturnValue('signedToken');

      const result = authService.issueToken(payload);

      expect(jwtServiceMock.sign).toHaveBeenCalledWith(payload);
    });
  });

  describe('googleLogin', () => {
    it('should return access token and user for valid Google login', async () => {
      const user = { email: 'test@example.com' };
      usersServiceMock.createGUser.mockResolvedValue(user);
      jwtServiceMock.sign.mockReturnValue('accessToken');

      const result = await authService.googleLogin({
        email: 'test@example.com',
      });

      expect(result).toEqual({ access_token: 'accessToken', user });
    });

    it('should throw BadRequestException for Google login error', async () => {
      usersServiceMock.createGUser.mockImplementation(() => {
        throw new Error('Google login error');
      });

      await expect(
        authService.googleLogin({ email: 'test@example.com' }),
      ).rejects.toThrowError(BadRequestException);
    });
  });
});
