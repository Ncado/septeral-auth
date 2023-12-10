import { generateRandomString } from '../../../utils/generate-random-string';

describe('generateRandomString', () => {
  it('should generate a different string each time', () => {
    const length = 5;
    const randomString1 = generateRandomString(length);
    const randomString2 = generateRandomString(length);

    expect(randomString1).not.toEqual(randomString2);
  });

  it('should handle zero length', () => {
    const length = 0;
    const randomString = generateRandomString(length);

    expect(randomString).toHaveLength(0);
  });

  it('should handle large length', () => {
    const length = 1000;
    const randomString = generateRandomString(length);

    expect(randomString).toHaveLength(length);
  });
});
