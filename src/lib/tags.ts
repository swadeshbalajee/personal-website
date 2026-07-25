export interface TagInfo {
  /** URL-safe identifier used in `/tags/[tag]` routes. */
  slug: string;
  /** Human-readable label, e.g. "Machine Learning". */
  name: string;
  count: number;
}

/** Normalizes a raw tag for case-insensitive comparison (trimmed, lowercase). */
export function normalizeTag(tag: string): string {
  return tag.trim().toLowerCase();
}

/** Converts a tag into a URL-safe slug, e.g. "Machine Learning" -> "machine-learning". */
export function slugifyTag(tag: string): string {
  return normalizeTag(tag)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/** Converts a tag into a human-readable display label, e.g. "raspberry-pi" -> "Raspberry Pi". */
export function humanizeTag(tag: string): string {
  return normalizeTag(tag)
    .split(/[-\s]+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Picks a display label for a raw tag: if the author already wrote it with
 * any uppercase (e.g. "LLMs", "Agentic AI"), that's trusted as-is — naive
 * title-casing would mangle acronyms. Plain lowercase-kebab tags (e.g.
 * "raspberry-pi") fall back to `humanizeTag`.
 */
export function displayNameFor(rawTag: string): string {
  const trimmed = rawTag.trim();
  return /[A-Z]/.test(trimmed) ? trimmed : humanizeTag(trimmed);
}

/**
 * Builds a de-duplicated, case-insensitive tag index (slug, display name,
 * article count) from a list of per-article tag arrays. Results are sorted
 * alphabetically by display name.
 */
export function buildTagIndex(tagLists: string[][]): TagInfo[] {
  const bySlug = new Map<string, TagInfo>();

  for (const tags of tagLists) {
    for (const rawTag of tags) {
      const slug = slugifyTag(rawTag);
      if (!slug) continue;

      const existing = bySlug.get(slug);
      if (existing) {
        existing.count += 1;
      } else {
        bySlug.set(slug, { slug, name: displayNameFor(rawTag), count: 1 });
      }
    }
  }

  return [...bySlug.values()].sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Merges a curated list of top-level categories (see `siteConfig.blogCategories`)
 * with real per-post tag counts, so every curated category always appears —
 * even at zero posts — in its configured order, followed by any additional
 * ad-hoc tags authors have used (sorted alphabetically).
 */
export function buildCategoryIndex(categories: string[], tagLists: string[][]): TagInfo[] {
  const discovered = buildTagIndex(tagLists);
  const bySlug = new Map(discovered.map((tag) => [tag.slug, tag]));

  const curated: TagInfo[] = categories.map((category) => {
    const slug = slugifyTag(category);
    const match = bySlug.get(slug);
    bySlug.delete(slug);
    return match ?? { slug, name: category, count: 0 };
  });

  const extra = [...bySlug.values()].sort((a, b) => a.name.localeCompare(b.name));

  return [...curated, ...extra];
}
