import { registerAs } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { Env } from '../utils/validate-env';

export const databaseConfig = registerAs(
  'databaseConfig',
  (): TypeOrmModuleOptions => ({
    type: 'postgres',
    host: Env.string('DB_HOST'),
    port: Env.number('DB_PORT'),
    username: Env.string('DB_USERNAME'),
    password: Env.string('DB_PASSWORD'),
    database: Env.string('DB_DATABASE'),
    autoLoadEntities: true,
    synchronize: true,
    // url: `postgres://user:password@postgres:5432/db`,
  }),
);
