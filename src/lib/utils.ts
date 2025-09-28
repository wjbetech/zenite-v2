import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function projectSlug(name: string): string {
  return slugify(name);
}

export function slugify(name: string): string {
  const raw = (name ?? '').toString();
  let s = raw.normalize('NFKD');

  // Map common unicode dash characters (including non-breaking hyphen) to '-'
  s = s.replace(/[\u2010-\u2015\u2212\u2012\u2013\u2011\u2014]/g, '-');

  // Remove combining diacritical marks (Unicode property 'M')
  try {
    s = s.replace(/\p{M}/gu, '');
  } catch (_err) {
    // reference the error to satisfy linters/environments
    void _err;
    s = s.replace(/[\u0300-\u036f]/g, '');
  }

  const base = s
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

  return base.length > 0 ? base : 'project';
}
