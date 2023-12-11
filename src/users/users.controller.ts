import {
  Controller,
  Get,
  Logger,
  NotFoundException,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CacheService } from '../cache/cache.service';
import { dumpUser } from '../utils/dumps';

@Controller('user')
export class UsersController {
  private logger = new Logger(UsersController.name);

  constructor(
    private usersService: UsersService,
    private cacheService: CacheService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async get(@Query('email') email: string) {
    const userData = await this.usersService.getUserByEmail(email);

    if (!userData) {
      throw new NotFoundException('User not found');
    }

    return dumpUser(userData);
  }
}
