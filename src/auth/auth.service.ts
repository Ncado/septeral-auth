import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  private logger = new Logger(AuthService.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
  ) {}

  async validate(email: string, password: string) {
    try {
      const user = await this.usersService.getUserByEmail(email);
      if (!user) {
        return null;
      }

      const isPasswordMatching = await bcrypt.compare(password, user.password);
      if (!isPasswordMatching) {
        throw new BadRequestException('Wrong credentials provided');
      }

      return user;
    } catch (error) {
      this.logger.error('Error validating user:', error.message);
      throw new BadRequestException('Unable to validate user');
    }
  }

  async login(loginDto: LoginDto) {
    try {
      const user = await this.usersService.getUserByEmail(loginDto.email);

      const payload = {
        email: loginDto.email,
        id: user.id,
      };
      const access_token = await this.issueToken(payload);
      return {
        access_token,
        user,
      };
    } catch (error) {
      this.logger.error('Error logging in:', error.message);
      throw new BadRequestException('Unable to login');
    }
  }

  async verify(token: string) {
    try {
      const decoded = this.jwtService.verify(token);

      const user = await this.usersService.getUserByEmail(decoded.email);
      if (!user) {
        throw new BadRequestException('Unable to get user from the token');
      }

      return user;
    } catch (error) {
      this.logger.error('Error verifying token:', error.message);
      throw new BadRequestException('Unable to verify token');
    }
  }

  async issueToken(payload: { email: string; id: number }) {
    try {
      return this.jwtService.sign({
        email: payload.email,
        sub: payload.id,
      });
    } catch (error) {
      this.logger.error('Error issuing token:', error.message);
      throw new BadRequestException('Unable to issue token');
    }
  }

  async googleLogin(user) {
    try {
      const newUser = await this.usersService.createGUser(user.email);
      const payload = {
        email: user.email,
        id: newUser.id,
      };

      const access_token = await this.issueToken(payload);

      return {
        access_token,
        user,
      };
    } catch (error) {
      this.logger.error('Error with Google login:', error.message);
      throw new BadRequestException('Unable to perform Google login');
    }
  }
}
