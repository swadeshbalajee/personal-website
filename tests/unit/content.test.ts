import { describe, expect, it } from 'vitest';
import {
  filterVisible,
  getAdjacentEntries,
  getRelatedEntries,
  isVisible,
  pickFeatured,
  sortByPublishedDateDesc,
} from '../../src/lib/content';

function post(
  id: string,
  overrides: Partial<{
    publishedAt: Date;
    draft: boolean;
    featured: boolean;
    tags: string[];
  }> = {},
) {
  return {
    id,
    data: {
      publishedAt: overrides.publishedAt ?? new Date('2026-01-01T00:00:00Z'),
      draft: overrides.draft ?? false,
      featured: overrides.featured ?? false,
      tags: overrides.tags ?? [],
    },
  };
}

describe('isVisible / filterVisible (draft filtering)', () => {
  it('hides drafts in production', () => {
    expect(isVisible(post('a', { draft: true }), true)).toBe(false);
    expect(isVisible(post('a', { draft: false }), true)).toBe(true);
  });

  it('shows drafts outside of production', () => {
    expect(isVisible(post('a', { draft: true }), false)).toBe(true);
  });

  it('filters a list according to build mode', () => {
    const posts = [post('a', { draft: true }), post('b', { draft: false })];
    expect(filterVisible(posts, true).map((p) => p.id)).toEqual(['b']);
    expect(filterVisible(posts, false).map((p) => p.id)).toEqual(['a', 'b']);
  });
});

describe('sortByPublishedDateDesc', () => {
  it('sorts newest first without mutating the input', () => {
    const posts = [
      post('old', { publishedAt: new Date('2025-01-01T00:00:00Z') }),
      post('new', { publishedAt: new Date('2026-01-01T00:00:00Z') }),
    ];
    const sorted = sortByPublishedDateDesc(posts);
    expect(sorted.map((p) => p.id)).toEqual(['new', 'old']);
    expect(posts.map((p) => p.id)).toEqual(['old', 'new']);
  });
});

describe('pickFeatured', () => {
  it('returns only featured entries, newest first, limited to N', () => {
    const posts = [
      post('a', { featured: true, publishedAt: new Date('2025-01-01T00:00:00Z') }),
      post('b', { featured: false }),
      post('c', { featured: true, publishedAt: new Date('2026-01-01T00:00:00Z') }),
    ];
    expect(pickFeatured(posts, 1).map((p) => p.id)).toEqual(['c']);
    expect(pickFeatured(posts, 5).map((p) => p.id)).toEqual(['c', 'a']);
  });
});

describe('getRelatedEntries', () => {
  it('ranks by overlapping tag count and excludes the current entry', () => {
    const current = post('current', { tags: ['astro', 'typescript'] });
    const all = [
      current,
      post('one-overlap', { tags: ['astro'] }),
      post('two-overlap', { tags: ['astro', 'typescript'] }),
      post('no-overlap', { tags: ['python'] }),
    ];

    const related = getRelatedEntries(current, all, 5);
    expect(related.map((p) => p.id)).toEqual(['two-overlap', 'one-overlap']);
  });

  it('is case-insensitive when matching tags', () => {
    const current = post('current', { tags: ['Astro'] });
    const other = post('other', { tags: ['astro'] });
    const related = getRelatedEntries(current, [current, other], 5);
    expect(related.map((p) => p.id)).toEqual(['other']);
  });

  it('respects the limit', () => {
    const current = post('current', { tags: ['astro'] });
    const all = [current, post('a', { tags: ['astro'] }), post('b', { tags: ['astro'] })];
    expect(getRelatedEntries(current, all, 1)).toHaveLength(1);
  });
});

describe('getAdjacentEntries', () => {
  it('finds the older (previous) and newer (next) entries in a newest-first list', () => {
    const sorted = [post('newest'), post('middle'), post('oldest')];
    const result = getAdjacentEntries(sorted[1]!, sorted);
    expect(result.next?.id).toBe('newest');
    expect(result.previous?.id).toBe('oldest');
  });

  it('returns no next for the newest entry and no previous for the oldest', () => {
    const sorted = [post('newest'), post('oldest')];
    expect(getAdjacentEntries(sorted[0]!, sorted).next).toBeUndefined();
    expect(getAdjacentEntries(sorted[1]!, sorted).previous).toBeUndefined();
  });
});
