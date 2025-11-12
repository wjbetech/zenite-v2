import { titleCase, sanitizeTitle } from '../text-format';

describe('titleCase capitalization rules', () => {
  test('preserves all-uppercase acronyms', () => {
    expect(titleCase('SUFS')).toBe('SUFS');
    expect(sanitizeTitle('NASA')).toBe('NASA');
    expect(titleCase('API and SDK')).toBe('API and SDK');
  });

  test('fixes mixed-case typos', () => {
    expect(titleCase('LOndon')).toBe('London');
    expect(titleCase('fRAud')).toBe('Fraud');
  });

  test('handles parentheses and punctuation', () => {
    expect(titleCase('SUFS (Seoul University of Foreign Studies)')).toBe(
      'SUFS (Seoul University of Foreign Studies)',
    );
  });
});
