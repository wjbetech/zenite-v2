import { toInitialUser } from '../auth-utils';

describe('toInitialUser', () => {
  test('returns undefined for non-object', () => {
    expect(toInitialUser(null)).toBeUndefined();
    expect(toInitialUser(undefined)).toBeUndefined();
    expect(toInitialUser('string')).toBeUndefined();
  });

  test('extracts fullName and imageUrl when present', () => {
    const res = toInitialUser({ fullName: 'Jane Doe', imageUrl: 'https://img' });
    expect(res).toEqual({ fullName: 'Jane Doe', imageUrl: 'https://img', email: undefined });
  });

  test('prefers primaryEmailAddress over emailAddresses', () => {
    const res = toInitialUser({
      primaryEmailAddress: { emailAddress: 'primary@example.com' },
      emailAddresses: [{ emailAddress: 'fallback@example.com' }],
    });
    expect(res).toEqual({ fullName: undefined, imageUrl: undefined, email: 'primary@example.com' });
  });

  test('falls back to first emailAddresses entry', () => {
    const res = toInitialUser({
      emailAddresses: [{ emailAddress: 'fallback@example.com' }],
    });
    expect(res).toEqual({
      fullName: undefined,
      imageUrl: undefined,
      email: 'fallback@example.com',
    });
  });

  test('handles malformed email shapes gracefully', () => {
    // intentionally malformed shapes: primaryEmailAddress missing emailAddress, and emailAddresses contains null
    const malformed: { primaryEmailAddress?: object; emailAddresses?: Array<{ emailAddress?: string | null } | null> } = {
      primaryEmailAddress: {},
      emailAddresses: [null],
    };
    const res = toInitialUser(malformed as unknown);
    expect(res).toEqual({ fullName: undefined, imageUrl: undefined, email: undefined });
  });
});
