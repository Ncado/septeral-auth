import {
  Body,
  Controller,
  Get,
  Logger,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { UsersService } from '../users/users.service';
import { CreateUserDto } from '../users/dto/input/create-user.input';
import { AuthGuard } from '@nestjs/passport';
import { LocalAuthGuard } from './guards/local-auth.guard';

@Controller()
export class AuthController {
  private logger = new Logger(AuthController.name);

  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  @UseGuards(LocalAuthGuard)
  @Post('/sessions')
  async sessions(@Body() sessionsDto: LoginDto, @Res() res) {
    try {
      const result = await this.authService.login(sessionsDto);

      res.cookie('user_token', result.access_token, {
        maxAge: 1000 * 60 * 60 * 600, // 24 hours
        httpOnly: true,
      });

      res.send(result);
      return result;
    } catch (error) {
      this.logger.error('Error in sessions:', error.message);
      res.status(500).send({ error });
    }
  }

  @Get('/google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@Req() req, @Res() res) {
    try {
      const authData = await this.authService.googleLogin(req.user);

      res.cookie('user_token', authData.access_token, {
        maxAge: 1000 * 60 * 60 * 600, // 24 hours
        httpOnly: true,
      });

      res.send(authData);
      return true;
    } catch (error) {
      this.logger.error('Error in googleAuthRedirect:', error.message);
      res.status(500).send({ error });
    }
  }

  @Post('signup')
  async create(@Body() dto: CreateUserDto, @Res() res) {
    try {
      const user = await this.usersService.createUser(dto);
      res.status(201).send(user);
    } catch (error) {
      this.logger.error('Error in create:', error.message);
      res.status(500).send({ error });
    }
  }
}
