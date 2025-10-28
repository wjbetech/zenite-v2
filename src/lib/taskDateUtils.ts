// Helpers for composing and normalizing task date/time fields
export function isIsoString(value: unknown): boolean {
  return typeof value === 'string' && value.indexOf('T') >= 0;
}

export function parseDateOrNull(value?: string | null): Date | null {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d;
}

export function toIso(d: Date): string {
  return d.toISOString();
}

// Compose a dueTime ISO string from an optional base date ISO and either an
// ISO datetime or an HH:MM time string. If `timeInput` is an ISO string it is
// validated and returned as-is. If `timeInput` is an HH:MM string we combine
// it with `baseDateIso` (or today's date if baseDateIso is missing). Returns
// null when no valid time can be composed.
export function composeDueTimeIso(
  baseDateIso?: string | null,
  timeInput?: string | null,
): string | null {
  if (timeInput === null) return null;
  if (!timeInput) return null;

  // If caller passed an ISO, return normalized ISO
  if (isIsoString(timeInput)) {
    const d = parseDateOrNull(timeInput);
    return d ? toIso(d) : null;
  }

  // Accept HH:MM format
  const hhmm = timeInput.trim();
  const m = hhmm.match(/^(\d{1,2}):(\d{2})$/);
  if (!m) return null;
  const hh = Number(m[1]);
  const mm = Number(m[2]);
  if (!Number.isFinite(hh) || !Number.isFinite(mm) || hh < 0 || hh > 23 || mm < 0 || mm > 59)
    return null;

  const base = parseDateOrNull(baseDateIso) ?? new Date();
  const composed = new Date(base.getFullYear(), base.getMonth(), base.getDate(), hh, mm, 0, 0);
  return toIso(composed);
}

// Adjust a startsAt ISO so its date portion matches `dueDateIso`. If startsAt
// is falsy, returns null. If startsAt is an ISO, preserves its time component
// but replaces the date with the due date. If dueDateIso is falsy, returns the
// original startsAt normalized to ISO (or null if invalid).
export function alignStartsAtToDueDate(
  startsAtIso?: string | null,
  dueDateIso?: string | null,
): string | null {
  const s = parseDateOrNull(startsAtIso);
  const due = parseDateOrNull(dueDateIso);
  if (!s) return null;
  if (!due) return toIso(s);
  const aligned = new Date(
    due.getFullYear(),
    due.getMonth(),
    due.getDate(),
    s.getHours(),
    s.getMinutes(),
    s.getSeconds(),
    s.getMilliseconds(),
  );
  return toIso(aligned);
}

// Default due time for a given date is 23:59 local time on that date
export function defaultDueTimeForDate(dateIso?: string | null): string | null {
  const d = parseDateOrNull(dateIso) ?? new Date();
  const def = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 0, 0);
  return toIso(def);
}
