import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { User } from './models/user';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUserDto } from './dto/input/create-user.input';
import { PasswordService } from '../utils/password.service';
import { UserOriginEnum } from './models/user-origin.enum';
import { CacheService } from '../cache/cache.service';

@Injectable()
export class UsersService {
  private logger = new Logger(UsersService.name);

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private readonly passwordService: PasswordService,
    private cacheService: CacheService,
  ) {}

  async getUserByEmail(email: string): Promise<User | undefined> {
    const cacheKey = `user:${email}`;
    try {
      const cachedUser = await this.cacheService.get<User>(cacheKey);
      if (cachedUser) {
        this.logger.log(`Getting data from cache for user ${email}`);
        return cachedUser;
      }

      const user = await this.userRepository.findOne({ where: { email } });
      if (!user) {
        throw new NotFoundException('User not found');
      }

      // Cache the user data
      await this.cacheService.set(cacheKey, user, 30); // 30 seconds TTL
      this.logger.log(`Data set to cache for user ${user.email}`);

      return user;
    } catch (error) {
      this.logger.error(
        `Error fetching user by email ${email}: ${error.message}`,
      );
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new NotFoundException('User not found');
    }
  }

  async createUser(createUserData: CreateUserDto): Promise<User> {
    try {
      if (
        await this.userRepository.findOne({
          where: { email: createUserData.email },
        })
      ) {
        throw new BadRequestException('User already exists');
      }
      console.log('createUserData', createUserData);

      const bycriptedPassword = await this.passwordService.hashPassword(
        createUserData.password,
      );

      const user = await this.userRepository.save({
        ...createUserData,
        origin: UserOriginEnum.CLASSIC,
        password: bycriptedPassword,
      });

      console.log('user', user);
      return user;
    } catch (error) {
      this.logger.error('Error creating user:', error.message);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Unable to create user');
    }
  }

  public async createGUser(email: string): Promise<User> {
    try {
      const curUser = await this.userRepository.findOne({
        where: { email },
      });
      if (curUser) {
        return curUser;
      }

      const obj = {
        email: email,
        age: null,
        password: null,
        origin: UserOriginEnum.GOOGLE,
      };
      const newUser = await this.userRepository.save(obj);
      return newUser;
    } catch (error) {
      this.logger.error('Error creating Google user:', error.message);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Unable to create Google user');
    }
  }
}
