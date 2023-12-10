import { Inject, Injectable, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { UsersService } from '../../users/users.service';
import { authConfig } from '../../config/auth.config';
import { ConfigType } from '@nestjs/config';
import { Request } from 'express';
import * as cookie from 'cookie';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private logger = new Logger(JwtStrategy.name);

  constructor(
    @Inject(authConfig.KEY)
    private config: ConfigType<typeof authConfig>,
    private readonly usersService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        JwtStrategy.extractJWT,
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      ignoreExpiration: false,
      secretOrKey: config.secret,
    });
  }

  private static extractJWT(req: Request): string | null {
    const cookies = req.headers.cookie || '';
    const parsedCookies = cookie.parse(cookies);

    if (
      req.headers.cookie &&
      'user_token' in parsedCookies &&
      parsedCookies.user_token.length > 0
    ) {
      return parsedCookies.user_token;
    }
    if (req.headers.authorization) {
      const res = req.headers.authorization.split(' ');
      return res[1];
    }

    return null;
  }

  validate(validationPayload: { sub: number; email: string }) {
    return this.usersService.getUserByEmail(validationPayload.email);
  }
}
