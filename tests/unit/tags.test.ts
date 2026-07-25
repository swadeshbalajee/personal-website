import { describe, expect, it } from 'vitest';
import { buildTagIndex, humanizeTag, normalizeTag, slugifyTag } from '../../src/lib/tags';

describe('normalizeTag', () => {
  it('trims and lowercases', () => {
    expect(normalizeTag('  Machine Learning  ')).toBe('machine learning');
  });
});

describe('slugifyTag', () => {
  it('converts spaces and mixed case into a hyphenated slug', () => {
    expect(slugifyTag('Machine Learning')).toBe('machine-learning');
  });

  it('collapses non-alphanumeric runs into a single hyphen', () => {
    expect(slugifyTag('C++ & Rust!!')).toBe('c-rust');
  });

  it('is case-insensitive: equivalent tags produce the same slug', () => {
    expect(slugifyTag('Astro')).toBe(slugifyTag('astro'));
    expect(slugifyTag('ASTRO')).toBe(slugifyTag('astro'));
  });

  it('strips leading and trailing hyphens', () => {
    expect(slugifyTag('  -Astro-  ')).toBe('astro');
  });
});

describe('humanizeTag', () => {
  it('title-cases a hyphenated tag', () => {
    expect(humanizeTag('raspberry-pi')).toBe('Raspberry Pi');
  });

  it('title-cases a single-word tag', () => {
    expect(humanizeTag('typescript')).toBe('Typescript');
  });
});

describe('buildTagIndex', () => {
  it('deduplicates case-insensitively and counts occurrences', () => {
    const index = buildTagIndex([['Astro', 'Web'], ['astro'], ['Machine Learning']]);

    const astro = index.find((tag) => tag.slug === 'astro');
    expect(astro?.count).toBe(2);
    expect(astro?.name).toBe('Astro');

    const web = index.find((tag) => tag.slug === 'web');
    expect(web?.count).toBe(1);
  });

  it('sorts results alphabetically by display name', () => {
    const index = buildTagIndex([['zebra'], ['astro'], ['machine-learning']]);
    expect(index.map((tag) => tag.name)).toEqual(['Astro', 'Machine Learning', 'Zebra']);
  });

  it('returns an empty array for no tags', () => {
    expect(buildTagIndex([])).toEqual([]);
  });
});
