import {
  normalizeWhitespace,
  trimAndCollapseSpaces,
  capitalizeFirstLetter,
  toSentenceCase,
  sanitizeText,
} from '@/lib/text-sanitizer';

describe('text-sanitizer helpers', () => {
  test('normalizeWhitespace collapses spaces and normalizes line endings', () => {
    const input = '  Hello\r\n\tWorld\n\n  Foo\u00A0Bar  ';
    expect(normalizeWhitespace(input)).toBe('Hello World Foo Bar');
  });

  test('trimAndCollapseSpaces collapses multiple spaces', () => {
    expect(trimAndCollapseSpaces('  a   b\t c  ')).toBe('a b c');
    expect(trimAndCollapseSpaces('')).toBe('');
  });

  test('capitalizeFirstLetter handles empty and single-char strings', () => {
    expect(capitalizeFirstLetter('hello')).toBe('Hello');
    expect(capitalizeFirstLetter('')).toBe('');
    expect(capitalizeFirstLetter('a')).toBe('A');
    expect(capitalizeFirstLetter('ábc')).toBe('Ábc');
  });

  test('toSentenceCase capitalizes first alpha and lowercases rest', () => {
    expect(toSentenceCase('  hELLo WORLD  ')).toBe('Hello world');
    expect(toSentenceCase('123  aBC')).toBe('123 abc');
    expect(toSentenceCase('!!!')).toBe('!!!');
    expect(toSentenceCase('')).toBe('');
  });

  test('sanitizeText default capitalizes first letter after normalization', () => {
    expect(sanitizeText('  hello   WORLD  ')).toBe('Hello WORLD');
  });

  test('sanitizeText with sentenceCase true converts to sentence case', () => {
    expect(sanitizeText('  hello   WORLD  ', { sentenceCase: true })).toBe('Hello world');
  });
});
