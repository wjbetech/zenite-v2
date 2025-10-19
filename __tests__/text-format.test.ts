import { titleCase, sanitizeTitle, sanitizeDescription } from '@/lib/text-format';

describe('text-format.titleCase', () => {
  test('basic title case', () => {
    expect(titleCase('create the next 1-2 presentations')).toBe(
      'Create the Next 1-2 Presentations',
    );
    expect(titleCase('hello world')).toBe('Hello World');
  });

  test('small words are lowercased when not first', () => {
    expect(titleCase('the quick brown fox')).toBe('The Quick Brown Fox');
    expect(titleCase('a tale of two cities')).toBe('A Tale of Two Cities');
    expect(titleCase('this is the project of a team')).toBe('This Is the Project of a Team');
  });

  test('hyphenated words are title-cased per segment', () => {
    expect(titleCase('state-of-the-art device')).toBe('State-of-the-Art Device');
    expect(titleCase('pre-and-post-processing')).toBe('Pre-and-Post-Processing');
  });

  test('numbers are preserved and not altered', () => {
    expect(titleCase('version 2.0 release')).toBe('Version 2.0 Release');
    expect(titleCase('update 1-2 items')).toBe('Update 1-2 Items');
  });

  test('custom small words list', () => {
    expect(titleCase('the little prince', ['little'])).toBe('The little Prince');
  });
});

describe('text-format.sanitizeTitle/sanitizeDescription', () => {
  test('sanitizeTitle uses titleCase and normalizes whitespace', () => {
    expect(sanitizeTitle('  multiple   spaces here  ')).toBe('Multiple Spaces Here');
  });

  test('sanitizeDescription normalizes whitespace and trims, capitalizes and adds terminal punctuation', () => {
    expect(sanitizeDescription('  line1\n\n line2  ')).toBe('Line1 line2.');
    expect(sanitizeDescription('')).toBe('');
  });
});
