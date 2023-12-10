import { Test, TestingModule } from '@nestjs/testing';
import { Redis } from 'ioredis';
import { CacheService } from '../../../cache/cache.service';

jest.mock('ioredis');

describe('CacheService', () => {
  let cacheService: CacheService;
  let redisClientMock: {
    get: jest.Mock;
    set: jest.Mock;
    del: jest.Mock;
  };

  beforeEach(async () => {
    redisClientMock = {
      get: jest.fn(),
      set: jest.fn(),
      del: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CacheService,
        {
          provide: 'REDIS_CLIENT',
          useValue: redisClientMock as unknown as Redis,
        },
      ],
    }).compile();

    cacheService = module.get<CacheService>(CacheService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(cacheService).toBeDefined();
  });

  describe('get', () => {
    it('should return parsed data when key exists', async () => {
      const expectedData = { foo: 'bar' };
      redisClientMock.get.mockResolvedValue(JSON.stringify(expectedData));

      const result = await cacheService.get('test-key');

      expect(result).toEqual(expectedData);
      expect(redisClientMock.get).toHaveBeenCalledWith('test-key');
    });

    it('should return null when key does not exist', async () => {
      redisClientMock.get.mockResolvedValue(null);

      const result = await cacheService.get('nonexistent-key');

      expect(result).toBeNull();
      expect(redisClientMock.get).toHaveBeenCalledWith('nonexistent-key');
    });
  });

  describe('set', () => {
    it('should set data with TTL when TTL is provided', async () => {
      const testData = { foo: 'bar' };
      await cacheService.set('test-key', testData, 60);

      expect(redisClientMock.set).toHaveBeenCalledWith(
        'test-key',
        JSON.stringify(testData),
        'EX',
        60,
      );
    });

    it('should set data without TTL when TTL is not provided', async () => {
      const testData = { foo: 'bar' };
      await cacheService.set('test-key', testData);

      expect(redisClientMock.set).toHaveBeenCalledWith(
        'test-key',
        JSON.stringify(testData),
        'EX',
        undefined,
      );
    });
  });

  describe('del', () => {
    it('should delete the specified key', async () => {
      await cacheService.del('test-key');

      expect(redisClientMock.del).toHaveBeenCalledWith('test-key');
    });
  });
});
