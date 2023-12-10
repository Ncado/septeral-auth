import { Global, Module } from '@nestjs/common';
import IORedis from 'ioredis';
import { redisConfig } from '../config/redis.config';
import { CacheService } from './cache.service';

@Global()
@Module({
  providers: [
    {
      provide: 'REDIS_CLIENT',
      useFactory: () => {
        return new IORedis(redisConfig().socket);
      },
    },
    CacheService,
  ],
  exports: ['REDIS_CLIENT', CacheService],
})
export class CacheModule {}
