export function isDbUnavailableError(err: unknown, res?: Response) {
  // If we have a Response and it's a server error, treat as DB unavailable
  if (res && !res.ok) return res.status >= 500 && res.status < 600;

  if (!err) return false;

  // Common prisma error shapes
  if (typeof err === 'object' && err !== null) {
    const maybe = err as Record<string, unknown>;
    const code = maybe.code;
    if (typeof code === 'string') {
      if (code.startsWith('P1') || code === 'P1001') return true;
    }
    const message = maybe.message;
    if (typeof message === 'string' && message.toLowerCase().includes('database')) return true;
  }

  // Fallback: network failure
  if (err instanceof TypeError && String(err.message).toLowerCase().includes('failed to fetch')) return true;

  return false;
}

export function extractErrorMessage(err: unknown) {
  if (!err) return '';
  if (typeof err === 'string') return err;
  if (err instanceof Error) return err.message;
  try {
    return JSON.stringify(err);
  } catch (e) {
    return String(e ?? err);
  }
}
