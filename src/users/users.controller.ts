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
    const cacheKey = `user:${email}`;

    const cachedData = await this.cacheService.get(cacheKey);
    if (cachedData) {
      this.logger.log('Getting data from cache');
      return cachedData;
    }

    const userData = await this.usersService.getUserByEmail(email);

    if (!userData) {
      throw new NotFoundException('User not found');
    }

    await this.cacheService.set(cacheKey, userData, 30);

    this.logger.log(`Data set to cache for user ${userData.email}`);
    return dumpUser(userData);
  }
}
