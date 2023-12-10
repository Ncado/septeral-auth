import { GoogleStrategy } from '../../../auth/strategies/google.strategy';

describe('GoogleStrategy', () => {
  let googleStrategy: GoogleStrategy;

  it('should be defined', () => {
    expect(googleStrategy).toBeDefined();
  });

  it('should call validate method', async () => {
    // Mock the necessary parameters for the validate method
    const access_token = 'mock-access-token';
    const refresh_token = 'mock-refresh-token';
    const profile = {
      name: { givenName: 'John', familyName: 'Doe' },
      emails: [{ value: 'john.doe@example.com' }],
      photos: [{ value: 'profile-picture-url' }],
    };

    // Mock the done callback function
    const doneMock = jest.fn();

    // Call the validate method
    await googleStrategy.validate(
      access_token,
      refresh_token,
      profile,
      doneMock,
    );

    // Assert that the done callback was called with the expected user object
    expect(doneMock).toHaveBeenCalledWith(null, {
      email: 'john.doe@example.com',
      firstName: 'John',
      lastName: 'Doe',
      picture: 'profile-picture-url',
      access_token: 'mock-access-token',
    });
  });
});
