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

@Injectable()
export class UsersService {
  private logger = new Logger(UsersService.name);

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private readonly passwordService: PasswordService,
  ) {}

  async getUserByEmail(value: string): Promise<User | undefined> {
    try {
      const user = await this.userRepository.findOne({
        where: { email: value },
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      return user;
    } catch (error) {
      this.logger.error('Error fetching user by email:', error.message);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new NotFoundException('User not found');
    }
  }

  async createUser(createUserData: CreateUserDto): Promise<User> {
    try {
      if (await this.getUserByEmail(createUserData.email)) {
        throw new BadRequestException('User already exists');
      }

      const bycriptedPassword = await this.passwordService.hashPassword(
        createUserData.password,
      );
      const user = await this.userRepository.save({
        ...createUserData,
        origin: UserOriginEnum.CLASSIC,
        password: bycriptedPassword,
      });

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
