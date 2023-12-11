import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsersService } from '../../../users/users.service';
import { User } from '../../../users/models/user';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from '../../../users/dto/input/create-user.input';
import { UserOriginEnum } from '../../../users/models/user-origin.enum';
import { PasswordService } from '../../../utils/password.service';
import { CacheService } from '../../../cache/cache.service';

describe('UsersService', () => {
  let usersService: UsersService;
  let userRepository: Repository<User>;
  let cacheService: CacheService; // Declare CacheService

  const mockUserRepository = {
    findOne: jest.fn(),
    save: jest.fn(),
  };

  const mockPasswordService = {
    hashPassword: jest.fn(),
  };

  const mockCacheService = {
    get: jest.fn(),
    set: jest.fn(),
  };
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: PasswordService,
          useValue: mockPasswordService,
        },
        {
          provide: CacheService,
          useValue: mockCacheService,
        },
      ],
    }).compile();

    usersService = module.get<UsersService>(UsersService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    cacheService = module.get<CacheService>(CacheService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getUserByEmail', () => {
    it('should return user if found', async () => {
      const mockUser: User = {
        id: 1,
        email: 'test@example.com',
        password: 'hashedPassword',
        origin: UserOriginEnum.CLASSIC,

        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockUserRepository.findOne.mockResolvedValue(mockUser);

      const result = await usersService.getUserByEmail('test@example.com');

      expect(result).toEqual(mockUser);
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
    });

    it('should throw NotFoundException if user not found', async () => {
      mockUserRepository.findOne.mockResolvedValue(undefined);

      await expect(
        usersService.getUserByEmail('nonexistent@example.com'),
      ).rejects.toThrowError('User not found');

      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { email: 'nonexistent@example.com' },
      });
    });

    it('should rethrow NotFoundException', async () => {
      mockUserRepository.findOne.mockRejectedValue(
        new NotFoundException('Custom not found error'),
      );

      await expect(
        usersService.getUserByEmail('test@example.com'),
      ).rejects.toThrowError('Custom not found error');

      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
    });

    it('should rethrow other errors', async () => {
      mockUserRepository.findOne.mockRejectedValue(
        new Error('Some other error'),
      );

      await expect(
        usersService.getUserByEmail('test@example.com'),
      ).rejects.toThrowError('User not found');

      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
    });
  });

  describe('createUser', () => {
    it('should create and return a new user', async () => {
      const mockCreateUserData: CreateUserDto = {
        email: 'newuser@example.com',
        password: 'password123',
      };
      const mockHashedPassword = 'hashedPassword';
      const mockNewUser: User = {
        id: 2,
        ...mockCreateUserData,
        origin: UserOriginEnum.CLASSIC,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockUserRepository.findOne.mockResolvedValue(undefined);
      mockPasswordService.hashPassword.mockResolvedValue(mockHashedPassword);
      mockUserRepository.save.mockResolvedValue(mockNewUser);

      const result = await usersService.createUser(mockCreateUserData);

      expect(result).toEqual(mockNewUser);
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { email: 'newuser@example.com' },
      });
      expect(mockPasswordService.hashPassword).toHaveBeenCalledWith(
        'password123',
      );
      expect(mockUserRepository.save).toHaveBeenCalledWith({
        ...mockCreateUserData,
        origin: UserOriginEnum.CLASSIC,
        password: mockHashedPassword,
      });
    });

    it('should throw BadRequestException if user already exists', async () => {
      const mockCreateUserData: CreateUserDto = {
        email: 'existinguser@example.com',
        password: 'password123',
      };

      mockUserRepository.findOne.mockResolvedValue({
        id: 1,
        ...mockCreateUserData,
        origin: UserOriginEnum.CLASSIC,
      });

      await expect(
        usersService.createUser(mockCreateUserData),
      ).rejects.toThrowError('User already exists');

      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { email: 'existinguser@example.com' },
      });
    });

    it('should rethrow BadRequestException', async () => {
      const mockCreateUserData: CreateUserDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      mockUserRepository.findOne.mockResolvedValue(undefined);
      mockPasswordService.hashPassword.mockRejectedValue(
        new BadRequestException('Custom bad request error'),
      );

      await expect(
        usersService.createUser(mockCreateUserData),
      ).rejects.toThrowError('Custom bad request error');

      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
      expect(mockPasswordService.hashPassword).toHaveBeenCalledWith(
        'password123',
      );
    });

    it('should rethrow other errors', async () => {
      const mockCreateUserData: CreateUserDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      mockUserRepository.findOne.mockResolvedValue(undefined);
      mockPasswordService.hashPassword.mockRejectedValue(
        new Error('Some other error'),
      );

      await expect(
        usersService.createUser(mockCreateUserData),
      ).rejects.toThrowError('Unable to create user');

      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
      expect(mockPasswordService.hashPassword).toHaveBeenCalledWith(
        'password123',
      );
    });
  });

  describe('createGUser', () => {
    it('should create and return a new Google user if not exists', async () => {
      const mockEmail = 'newgoogleuser@example.com';
      const mockNewGoogleUser: User = {
        id: 3,
        email: mockEmail,
        origin: UserOriginEnum.GOOGLE,

        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockUserRepository.findOne.mockResolvedValue(undefined);
      mockUserRepository.save.mockResolvedValue(mockNewGoogleUser);

      const result = await usersService.createGUser(mockEmail);

      expect(result).toEqual(mockNewGoogleUser);
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { email: mockEmail },
      });
      expect(mockUserRepository.save).toHaveBeenCalledWith({
        email: mockEmail,
        age: null,
        password: null,
        origin: UserOriginEnum.GOOGLE,
      });
    });

    it('should rethrow BadRequestException', async () => {
      const mockEmail = 'test@example.com';

      mockUserRepository.findOne.mockResolvedValue(undefined);
      mockUserRepository.save.mockRejectedValue(
        new BadRequestException('Custom bad request error'),
      );

      await expect(usersService.createGUser(mockEmail)).rejects.toThrowError(
        'Custom bad request error',
      );

      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { email: mockEmail },
      });
      expect(mockUserRepository.save).toHaveBeenCalledWith({
        email: mockEmail,
        age: null,
        password: null,
        origin: UserOriginEnum.GOOGLE,
      });
    });

    it('should rethrow other errors', async () => {
      const mockEmail = 'test@example.com';

      mockUserRepository.findOne.mockResolvedValue(undefined);
      mockUserRepository.save.mockRejectedValue(
        new Error('Unable to create use'),
      );

      await expect(usersService.createGUser(mockEmail)).rejects.toThrowError(
        'Unable to create Google user',
      );

      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { email: mockEmail },
      });
      expect(mockUserRepository.save).toHaveBeenCalledWith({
        email: mockEmail,
        age: null,
        password: null,
        origin: UserOriginEnum.GOOGLE,
      });
    });
  });
});
