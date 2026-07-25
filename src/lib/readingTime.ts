import readingTimeEstimator from 'reading-time';

export interface ReadingTimeResult {
  /** Human-readable label, e.g. "6 min read". */
  text: string;
  minutes: number;
  words: number;
}

/**
 * Estimates reading time from raw article text (Markdown/MDX source is fine —
 * the underlying library counts words, not rendered nodes). Minutes are
 * rounded up to the nearest whole minute with a floor of 1.
 */
export function getReadingTime(content: string): ReadingTimeResult {
  const stats = readingTimeEstimator(content);
  const minutes = Math.max(1, Math.ceil(stats.minutes));
  return {
    text: `${minutes} min read`,
    minutes,
    words: stats.words,
  };
}
