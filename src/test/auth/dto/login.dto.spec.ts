import { validate } from 'class-validator';
import { LoginDto } from '../../../auth/dto/login.dto';

describe('LoginDto', () => {
  it('should not throw validation error for valid input', async () => {
    const loginDto = new LoginDto();
    loginDto.email = 'valid@example.com';
    loginDto.password = 'securePassword';

    // Validate the LoginDto using class-validator
    const errors = await validate(loginDto);

    // Assert that there are no validation errors
    expect(errors.length).toBe(0);
  });
});
