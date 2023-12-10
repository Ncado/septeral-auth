import { registerAs } from '@nestjs/config';
import { Env } from '../utils/validate-env';

export const bcryptConfig = registerAs('bcryptConfig', () => ({
  saltRounds: Env.number('BCRYPT_SALT_ROUNDS'),
}));
