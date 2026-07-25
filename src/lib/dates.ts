const LONG_DATE_FORMATTER = new Intl.DateTimeFormat('en-US', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  timeZone: 'UTC',
});

const SHORT_DATE_FORMATTER = new Intl.DateTimeFormat('en-US', {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
  timeZone: 'UTC',
});

/**
 * Formats a date as e.g. "January 5, 2026". Dates are treated as UTC so a
 * `2026-01-05` frontmatter value never shifts to the previous day locally.
 */
export function formatDateLong(date: Date): string {
  return LONG_DATE_FORMATTER.format(date);
}

/** Formats a date as e.g. "Jan 5, 2026". */
export function formatDateShort(date: Date): string {
  return SHORT_DATE_FORMATTER.format(date);
}

/** Formats a date as an ISO calendar date (`YYYY-MM-DD`) for `<time datetime>`. */
export function formatDateISO(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/** Returns the UTC calendar year, used for archive grouping. */
export function getYear(date: Date): number {
  return date.getUTCFullYear();
}

/**
 * Groups items by UTC year, sorted newest year first. Items within a year
 * preserve their input order.
 */
export function groupByYear<T>(items: T[], getDate: (item: T) => Date): Map<number, T[]> {
  const groups = new Map<number, T[]>();
  for (const item of items) {
    const year = getYear(getDate(item));
    const existing = groups.get(year);
    if (existing) {
      existing.push(item);
    } else {
      groups.set(year, [item]);
    }
  }
  return new Map([...groups.entries()].sort((a, b) => b[0] - a[0]));
}
