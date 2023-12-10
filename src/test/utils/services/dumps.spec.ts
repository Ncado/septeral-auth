import { User } from '../../../users/models/user';
import { dumpUser } from '../../../utils/dumps';
import { UserOriginEnum } from '../../../users/models/user-origin.enum';

describe('dumpUser', () => {
  it('should exclude id, password, origin, createdAt, and updatedAt fields', () => {
    const user: User = {
      id: 1,
      email: 'test@example.com',
      password: 'password123',
      origin: UserOriginEnum.CLASSIC,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const dumpedUser = dumpUser(user);

    expect(dumpedUser).not.toHaveProperty('id');
    expect(dumpedUser).not.toHaveProperty('password');
    expect(dumpedUser).not.toHaveProperty('classic');
  });
});
