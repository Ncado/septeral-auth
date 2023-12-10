import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { databaseConfig } from './config/database.config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { CacheModule } from './cache/cache.module';

@Module({
  imports: [
    ConfigModule.forRoot(),

    UsersModule,
    AuthModule,
    AuthModule,
    // CacheModule.registerAsync({
    //   isGlobal: true,
    //   useFactory: async () => ({
    //     store: await redisStore(redisConfig()),
    //   }),
    // }),
    TypeOrmModule.forRootAsync(databaseConfig.asProvider()),
    CacheModule,
  ],
  providers: [],
})
export class AppModule {}
