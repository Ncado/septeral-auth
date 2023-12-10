import { User } from '../users/models/user';
import { UserToDump } from '../users/models/userToDump.type';

export function dumpUser(user: User): UserToDump {
  const { id, password, ...userWithoutSensitiveData } = user;
  return userWithoutSensitiveData;
}
