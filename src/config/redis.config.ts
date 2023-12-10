import { registerAs } from '@nestjs/config';
import { Env } from '../utils/validate-env';

export const redisConfig = registerAs('redisConfig', () => ({
  socket: {
    host: Env.string('REDIS_HOST'),
    port: Env.number('REDIS_PORT'),
  },
}));
