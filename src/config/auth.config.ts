import { registerAs } from '@nestjs/config';
import { Env } from '../utils/validate-env';

export const authConfig = registerAs('authConfig', () => ({
  secret: Env.string('JWT_SECRET'),
  signOptions: { expiresIn: '365d' },

  google: {
    clientID: Env.string('GOOGLE_CLIENT_ID'),
    clientSecret: Env.string('GOOGLE_CLIENT_SECRET'),
    callbackURL: Env.string('GOOGLE_CALLBACK_URL'),
  },
}));
