import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { bcryptConfig } from '../config/bcrypt.config';
import { User } from './models/user';
import { UtilsModule } from '../utils/utils.module';
import { CacheModule } from '../cache/cache.module';

@Module({
  controllers: [UsersController],
  imports: [
    TypeOrmModule.forFeature([User]),
    ConfigModule.forFeature(bcryptConfig),
    UtilsModule,
    CacheModule,
  ],
  exports: [UsersService],
  providers: [UsersService],
})
export class UsersModule {}
