import { describe, expect, it } from 'vitest';
import { getReadingTime } from '../../src/lib/readingTime';

describe('getReadingTime', () => {
  it('returns a minimum of 1 minute for very short content', () => {
    const result = getReadingTime('A short sentence.');
    expect(result.minutes).toBe(1);
    expect(result.text).toBe('1 min read');
  });

  it('counts words and estimates minutes for longer content', () => {
    const words = Array.from({ length: 600 }, () => 'word').join(' ');
    const result = getReadingTime(words);

    expect(result.words).toBe(600);
    expect(result.minutes).toBeGreaterThan(1);
    expect(result.text).toBe(`${result.minutes} min read`);
  });

  it('rounds up rather than down', () => {
    // Roughly 201 words at ~200 wpm should round up to 2 minutes, not stay at 1.
    const words = Array.from({ length: 201 }, () => 'word').join(' ');
    const result = getReadingTime(words);
    expect(result.minutes).toBeGreaterThanOrEqual(2);
  });
});
