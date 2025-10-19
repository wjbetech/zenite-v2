const ACTIVITY_COOKIE_KEY = 'zenite.activityOpen';
const ACTIVITY_RANGE_KEY = 'zenite.activityRange';

function readCookie(key: string): string | null {
  if (typeof document === 'undefined') return null;
  try {
    const m = document.cookie.match(new RegExp('(?:^|; )' + key + '=([^;]*)'));
    if (!m) return null;
    return decodeURIComponent(m[1]);
  } catch {
    return null;
  }
}

function writeCookie(key: string, value: string) {
  if (typeof document === 'undefined') return;
  try {
    const maxAge = 60 * 60 * 24 * 365; // 1 year
    document.cookie = `${key}=${encodeURIComponent(
      value,
    )}; Path=/; Max-Age=${maxAge}; SameSite=Lax`;
  } catch {
    // ignore
  }
}

export function readActivityOpenFromCookie(): boolean | null {
  const v = readCookie(ACTIVITY_COOKIE_KEY);
  if (v === null) return null;
  return v === '1';
}

export function writeActivityOpenToCookie(open: boolean) {
  writeCookie(ACTIVITY_COOKIE_KEY, open ? '1' : '0');
}

export function readActivityRangeFromCookie(): string | null {
  const v = readCookie(ACTIVITY_RANGE_KEY);
  if (!v) return null;
  return v;
}

export function writeActivityRangeToCookie(range: string) {
  writeCookie(ACTIVITY_RANGE_KEY, range);
}
