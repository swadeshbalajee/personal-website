import { describe, expect, it } from 'vitest';
import {
  formatDateISO,
  formatDateLong,
  formatDateShort,
  getYear,
  groupByYear,
} from '../../src/lib/dates';

describe('formatDateLong', () => {
  it('formats a date as a full month name, day, and year', () => {
    expect(formatDateLong(new Date('2026-01-05T00:00:00Z'))).toBe('January 5, 2026');
  });
});

describe('formatDateShort', () => {
  it('formats a date with an abbreviated month', () => {
    expect(formatDateShort(new Date('2026-01-05T00:00:00Z'))).toBe('Jan 5, 2026');
  });
});

describe('formatDateISO', () => {
  it('formats a date as YYYY-MM-DD', () => {
    expect(formatDateISO(new Date('2026-03-18T00:00:00Z'))).toBe('2026-03-18');
  });
});

describe('getYear', () => {
  it('returns the UTC calendar year', () => {
    expect(getYear(new Date('2026-12-31T23:59:59Z'))).toBe(2026);
  });
});

describe('groupByYear', () => {
  it('groups items by year, newest year first', () => {
    const items = [
      { id: 'a', date: new Date('2025-06-01T00:00:00Z') },
      { id: 'b', date: new Date('2026-01-01T00:00:00Z') },
      { id: 'c', date: new Date('2025-01-01T00:00:00Z') },
    ];

    const grouped = groupByYear(items, (item) => item.date);

    expect([...grouped.keys()]).toEqual([2026, 2025]);
    expect(grouped.get(2025)?.map((item) => item.id)).toEqual(['a', 'c']);
    expect(grouped.get(2026)?.map((item) => item.id)).toEqual(['b']);
  });

  it('returns an empty map for an empty input', () => {
    expect(groupByYear([], () => new Date()).size).toBe(0);
  });
});
