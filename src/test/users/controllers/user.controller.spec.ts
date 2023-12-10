import { UsersService } from '../../../users/users.service';
import { CacheService } from '../../../cache/cache.service';
import { UsersController } from '../../../users/users.controller';
import { dumpUser } from '../../../utils/dumps';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';
import * as request from 'supertest';
import { UserOriginEnum } from '../../../users/models/user-origin.enum';

describe('UsersController', () => {
  let app: INestApplication;
  let usersService: UsersService;
  let cacheService: CacheService;

  const mockUsersService = {
    getUserByEmail: jest.fn(),
  };

  const mockCacheService = {
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        { provide: UsersService, useValue: mockUsersService },
        { provide: CacheService, useValue: mockCacheService },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    app = module.createNestApplication();
    await app.init();

    usersService = module.get<UsersService>(UsersService);
    cacheService = module.get<CacheService>(CacheService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('/user (GET) should return user data', async () => {
    const mockUser = {
      id: 1,
      email: 'test@example.com',
      password: 'hashedPassword',
      origin: UserOriginEnum.GOOGLE,

      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockUsersService.getUserByEmail.mockResolvedValue(mockUser);
    mockCacheService.get.mockResolvedValue(null);

    const response = await request(app.getHttpServer())
      .get('/user')
      .query({ email: 'test@example.com' })
      .expect(200);

    expect(mockUsersService.getUserByEmail).toHaveBeenCalledWith(
      'test@example.com',
    );
    expect(mockCacheService.get).toHaveBeenCalledWith('user:test@example.com');
  });

  it('/user (GET) should return cached user data', async () => {
    const mockUser = {
      id: 1,
      email: 'test@example.com',
      password: 'hashedPassword',
      origin: UserOriginEnum.GOOGLE,

      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockCacheService.get.mockResolvedValue(dumpUser(mockUser));

    const response = await request(app.getHttpServer())
      .get('/user')
      .query({ email: 'test@example.com' })
      .expect(200);

    expect(mockUsersService.getUserByEmail).not.toHaveBeenCalled();
    expect(mockCacheService.get).toHaveBeenCalledWith('user:test@example.com');
    expect(mockCacheService.set).not.toHaveBeenCalled();
  });

  it('/user (GET) should handle user not found', async () => {
    mockUsersService.getUserByEmail.mockResolvedValue(null);
    mockCacheService.get.mockResolvedValue(null);

    await request(app.getHttpServer())
      .get('/user')
      .query({ email: 'nonexistent@example.com' })
      .expect(404);

    expect(mockUsersService.getUserByEmail).toHaveBeenCalledWith(
      'nonexistent@example.com',
    );
    expect(mockCacheService.get).toHaveBeenCalledWith(
      'user:nonexistent@example.com',
    );
    expect(mockCacheService.set).not.toHaveBeenCalled();
  });

  afterAll(async () => {
    await app.close();
  });
});
