import type { CollectionEntry } from 'astro:content';
import { getReadingTime } from './readingTime';
import { normalizeTag } from './tags';

/**
 * These helpers operate on plain `{ id, data }` shapes compatible with Astro
 * `CollectionEntry<'blog' | 'projects'>` objects, but intentionally avoid
 * importing `astro:content` so they stay pure and unit-testable outside of
 * Astro's build pipeline. Pages call `getCollection()` themselves and pass
 * the results through these functions.
 */

export interface EntryLike {
  id: string;
}

export interface DatedEntry extends EntryLike {
  data: {
    publishedAt: Date;
  };
}

export interface DraftableEntry extends EntryLike {
  data: {
    draft: boolean;
  };
}

export interface FeaturableEntry extends DatedEntry {
  data: DatedEntry['data'] & {
    featured: boolean;
  };
}

export interface TaggedEntry extends DatedEntry {
  data: DatedEntry['data'] & {
    tags: string[];
  };
}

/**
 * Whether a draftable entry should be visible. Drafts are hidden from
 * production builds but shown during local development so authors can
 * preview them (see docs/AUTHORING.md draft workflow).
 */
export function isVisible(entry: DraftableEntry, isProd: boolean): boolean {
  return isProd ? !entry.data.draft : true;
}

/** Filters a list of entries down to the ones visible for the current build mode. */
export function filterVisible<T extends DraftableEntry>(entries: T[], isProd: boolean): T[] {
  return entries.filter((entry) => isVisible(entry, isProd));
}

/** Sorts entries by publication date, newest first. */
export function sortByPublishedDateDesc<T extends DatedEntry>(entries: T[]): T[] {
  return [...entries].sort((a, b) => b.data.publishedAt.valueOf() - a.data.publishedAt.valueOf());
}

/** Picks the N most recently published, featured entries. */
export function pickFeatured<T extends FeaturableEntry>(entries: T[], limit: number): T[] {
  return sortByPublishedDateDesc(entries.filter((entry) => entry.data.featured)).slice(0, limit);
}

/**
 * Ranks other entries by number of overlapping tags (descending), breaking
 * ties by recency, and returns the top `limit` matches. Entries with zero
 * overlapping tags are excluded.
 */
export function getRelatedEntries<T extends TaggedEntry>(
  current: T,
  allEntries: T[],
  limit = 3,
): T[] {
  const currentTags = new Set(current.data.tags.map(normalizeTag));

  return allEntries
    .filter((entry) => entry.id !== current.id)
    .map((entry) => {
      const overlap = entry.data.tags.filter((tag) => currentTags.has(normalizeTag(tag))).length;
      return { entry, overlap };
    })
    .filter(({ overlap }) => overlap > 0)
    .sort((a, b) => {
      if (b.overlap !== a.overlap) return b.overlap - a.overlap;
      return b.entry.data.publishedAt.valueOf() - a.entry.data.publishedAt.valueOf();
    })
    .slice(0, limit)
    .map(({ entry }) => entry);
}

export interface AdjacentEntries<T> {
  /** The chronologically older entry (published before `current`), if any. */
  previous?: T;
  /** The chronologically newer entry (published after `current`), if any. */
  next?: T;
}

/**
 * Finds the entries immediately before/after `current` within a list that is
 * already sorted newest-first (e.g. via `sortByPublishedDateDesc`).
 */
export function getAdjacentEntries<T extends EntryLike>(
  current: T,
  sortedNewestFirst: T[],
): AdjacentEntries<T> {
  const index = sortedNewestFirst.findIndex((entry) => entry.id === current.id);
  if (index === -1) return {};

  return {
    next: index > 0 ? sortedNewestFirst[index - 1] : undefined,
    previous: index < sortedNewestFirst.length - 1 ? sortedNewestFirst[index + 1] : undefined,
  };
}

export interface ArticleSummary {
  id: string;
  href: string;
  title: string;
  description: string;
  publishedAt: Date;
  updatedAt?: Date;
  tags: string[];
  featured: boolean;
  draft: boolean;
  cover?: ImageMetadata;
  coverAlt?: string;
  readingTimeText: string;
}

/** Maps a raw blog collection entry to the view-model shared by article cards, the blog index, and related-article lists. */
export function toArticleSummary(entry: CollectionEntry<'blog'>): ArticleSummary {
  return {
    id: entry.id,
    href: `/blog/${entry.id}`,
    title: entry.data.title,
    description: entry.data.description,
    publishedAt: entry.data.publishedAt,
    updatedAt: entry.data.updatedAt,
    tags: entry.data.tags,
    featured: entry.data.featured,
    draft: entry.data.draft,
    cover: entry.data.cover,
    coverAlt: entry.data.coverAlt,
    readingTimeText: getReadingTime(entry.body ?? '').text,
  };
}

export interface ProjectSummary {
  id: string;
  href: string;
  title: string;
  summary: string;
  publishedAt: Date;
  updatedAt?: Date;
  tags: string[];
  featured: boolean;
  status: CollectionEntry<'projects'>['data']['status'];
  cover?: ImageMetadata;
  coverAlt?: string;
  repositoryUrl?: string;
  liveUrl?: string;
  technologies: string[];
  /** True when `href` points off-site (e.g. straight to GitHub) rather than to a local project page. */
  external: boolean;
}

/** Maps a raw projects collection entry to the view-model shared by project cards and the projects index. */
export function toProjectSummary(entry: CollectionEntry<'projects'>): ProjectSummary {
  return {
    id: entry.id,
    href: `/projects/${entry.id}`,
    title: entry.data.title,
    summary: entry.data.summary,
    publishedAt: entry.data.publishedAt,
    updatedAt: entry.data.updatedAt,
    tags: entry.data.tags,
    featured: entry.data.featured,
    status: entry.data.status,
    cover: entry.data.cover,
    coverAlt: entry.data.coverAlt,
    repositoryUrl: entry.data.repositoryUrl,
    liveUrl: entry.data.liveUrl,
    technologies: entry.data.technologies,
    external: false,
  };
}

/**
 * Maps a GitHub-auto-synced project entry (see githubProjectsLoader.ts) to
 * the same view-model. These have no local detail page — the card links
 * straight to the GitHub repository instead.
 */
export function toGithubProjectSummary(entry: CollectionEntry<'githubProjects'>): ProjectSummary {
  return {
    id: entry.id,
    href: entry.data.repositoryUrl,
    title: entry.data.title,
    summary: entry.data.summary,
    publishedAt: entry.data.publishedAt,
    updatedAt: entry.data.updatedAt,
    tags: entry.data.tags,
    featured: entry.data.featured,
    status: entry.data.status,
    liveUrl: entry.data.liveUrl,
    technologies: entry.data.technologies,
    external: true,
  };
}

export type AnyProjectEntry = CollectionEntry<'projects'> | CollectionEntry<'githubProjects'>;

/** Maps either a local or a GitHub-auto-synced project entry to the shared view-model. */
export function toAnyProjectSummary(entry: AnyProjectEntry): ProjectSummary {
  return entry.collection === 'githubProjects'
    ? toGithubProjectSummary(entry)
    : toProjectSummary(entry);
}
