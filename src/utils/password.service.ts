import { Inject, Injectable } from '@nestjs/common';
import { bcryptConfig } from '../config/bcrypt.config';
import { ConfigType } from '@nestjs/config';
import * as bcrypt from 'bcrypt';

@Injectable()
export class PasswordService {
  constructor(
    @Inject(bcryptConfig.KEY)
    private configBcrypt: ConfigType<typeof bcryptConfig>,
  ) {}

  hashPassword(password: string): any {
    return bcrypt.hash(password, this.configBcrypt.saltRounds);
  }

  comparePassword(firstPassword, secondPassword): any {
    return bcrypt.compare(firstPassword, secondPassword);
  }
}
