import { User } from './user';

export type UserToDump = Omit<User, 'id' | 'password'>;
