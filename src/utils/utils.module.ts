import { Module } from '@nestjs/common';
import { PasswordService } from './password.service';
import { ConfigModule } from '@nestjs/config';
import { bcryptConfig } from '../config/bcrypt.config';

@Module({
  imports: [ConfigModule.forFeature(bcryptConfig)],
  providers: [PasswordService],
  exports: [PasswordService],
})
export class UtilsModule {}
