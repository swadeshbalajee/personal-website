# Customization guide

Everything personal or site-specific is centralized in a small number of places. This is a map of
what to edit for common changes. None of this covers hosting or deployment — see the root
[README.md](../README.md) for why that's intentionally excluded.

## Name, biography, email, social links, navigation

All in `src/config/site.ts`:

```ts
export const siteConfig: SiteConfig = {
  name: 'Your Name',
  title: 'Software Engineer',
  shortBio: '...',
  longIntro: '...',
  email: 'your-email@example.com',
  nav: [/* ... */],
  social: [/* ... */],
  // ...
};
```

- `nav` controls the header/footer navigation links (label + href pairs).
- `social` controls the icon links in the header, footer, mobile menu, and contact page. The
  `icon` field must be one of the names implemented in `src/components/common/Icon.astro`
  (`github`, `linkedin`, `mail`, `rss`, `link`).
- `skills` and `currentlyExploring` feed the homepage's compact skills section and the About page.

## About page content

`src/pages/about.astro` has its own local arrays (`bioParagraphs`, `experience`, `education`,
`interests`, `certifications`, `honors`) near the top of the frontmatter script — edit those
directly. They're deliberately not in `site.ts` because they're prose-heavy rather than simple
config values.

## Accent color and other design tokens

`src/styles/tokens.css` defines the whole color system as CSS custom properties, separately for
light and dark themes. To change the accent color, edit `--color-accent`,
`--color-accent-strong`, and `--color-accent-soft` in **both** the `:root, :root[data-theme='light']`
block and the `:root[data-theme='dark']` block (and the matching `@media (prefers-color-scheme:
dark)` fallback block) so both themes stay coherent.

Other tokens worth knowing about:

- `--content-width` — max width of page containers (default `1200px`).
- `--article-width` — max width of article body text (default `74ch`).
- `--radius-sm` / `--radius-md` / `--radius-lg` — border-radius scale used throughout.

Code blocks are intentionally always rendered on a dark surface regardless of the site's light/dark
theme (see `src/styles/code.css` and the `shikiConfig` in `astro.config.mjs`) — this mirrors a
common technical-blog convention. To change the code block's own color scheme, edit
`--color-code-block-bg` / `--color-code-block-text` in `tokens.css` and the `shikiConfig.theme`
value in `astro.config.mjs` (must be a [bundled Shiki theme name](https://shiki.style/themes)).

## Homepage content

`src/pages/index.astro` renders the hero, featured projects/articles, skills, "currently
exploring," and contact CTA sections. The hero text and skills come from `site.ts`; featured
projects/articles are pulled automatically from content marked `featured: true`, up to
`siteConfig.featuredProjectCount` / `featuredArticleCount`.

## Projects

Add or edit files under `src/content/projects/`. See `docs/AUTHORING.md` for the full frontmatter
reference.

## Auto-synced GitHub projects

The Projects page also pulls in repositories automatically from GitHub — no separate content file
needed. It works at **build time only** (during `npm run dev` startup and `npm run build`); the
built site makes no runtime calls to GitHub.

**How a repo gets picked up:** its README's last non-blank line must read, exactly:

```text
Website: Approved
```

(case-insensitive, extra whitespace around the colon is fine). Add that line to a public,
non-fork repository's README and it appears under Projects on the next build; remove the line (or
make the repo private) and it drops out again.

**Status and featured, controlled from the repo itself.** Two more optional lines, anywhere else
in the README, work the same way `status` and `featured` do in a local project's frontmatter:

```text
Status: in-progress
Featured: true
```

`Status` must be one of `planned`, `in-progress`, `completed`, `archived` (case-insensitive). If
omitted, it defaults to `archived` when GitHub reports the repo as archived, `completed`
otherwise. `Featured` accepts `true` or `yes`; omitted means not featured. Unlike local projects
(where these are frontmatter fields you edit directly), auto-synced projects only ever take these
values from the repo's own README — there's no local override.

**Configuration:**

- `siteConfig.githubUsername` in `src/config/site.ts` — the GitHub account that gets scanned.
- Optionally set a `GITHUB_TOKEN` environment variable (a [fine-grained personal access
  token](https://github.com/settings/tokens) with public-repo read access is enough) before
  running `npm run dev` / `npm run build`. This raises the GitHub API rate limit from 60 to 5,000
  requests/hour — only needed if you have many repositories. Without it, the feature still works,
  just with a lower request budget per hour.

**What's shown:** the repo name, topics (as tags/technologies), and its `homepage` field (as a
secondary "Live" link) if set. The card's title links straight to the GitHub repository —
auto-synced projects don't get a local `/projects/<slug>` detail page.

The card's summary text uses the repo's GitHub "description" field (the text shown next to the
repo name — set via the repo's Settings, or `gh repo edit --description "..."`) when it's
non-empty. If that field is blank, the loader falls back to the first paragraph of prose in the
README instead of showing nothing — it skips the title heading and any badge/image rows first, so
a normal README (title, badges, then a description paragraph) works without extra effort.

**Failure handling:** if GitHub is unreachable, rate-limited, or the configured username doesn't
resolve, the loader logs a warning and simply contributes zero projects for that build — it never
fails `npm run build` or `npm run dev`.

The implementation lives in `src/lib/githubProjectsLoader.ts` (a custom Astro Content Layer
loader) and is registered as the `githubProjects` collection in `src/content.config.ts`.

> Until at least one repo is approved, `npm run build` prints `The collection "githubProjects"
does not exist or is empty. Please check your content config file for errors.` — that's Astro's
> own generic message for any empty collection, not a real problem. It goes away once a repo is
> approved.

## Blog posts

Add or edit folders under `src/content/blog/`. See `docs/AUTHORING.md` and
`docs/OBSIDIAN_SETUP.md`.

## Default SEO values and social image

Also in `src/config/site.ts`, under `seo`:

```ts
seo: {
  defaultTitle: 'Your Name — Software Engineer',
  titleTemplate: '%s — Your Name',
  defaultDescription: '...',
  defaultSocialImage: '/social-card.svg',
},
```

`defaultSocialImage` points at a file in `public/`. The bundled `public/social-card.svg` is a
placeholder — for the widest compatibility with link-preview crawlers (some don't render SVG),
consider replacing it with a 1200×630 PNG or JPG before publishing, and update this path to match.

## Favicon and icons

`public/favicon.svg` and `public/icons/` contain a placeholder abstract mark — replace them with
your own artwork. Keep `public/favicon.svg` as an SVG (referenced directly in
`src/layouts/BaseLayout.astro`), or update that reference if you switch formats.

## Giscus comments configuration

Comments are **disabled by default** (`comments.enabled: false` in `site.ts`) because they require
repository identifiers from a real GitHub repository, which this template can't know in advance.

To enable them:

1. Set up [giscus](https://giscus.app/) against a public GitHub repository with Discussions
   enabled, and follow its configuration wizard to obtain `repo`, `repoId`, `category`, and
   `categoryId`.
2. In `src/config/site.ts`, set `comments.enabled = true` and fill in `comments.giscus` with those
   values (a commented-out example is already there).
3. `src/components/blog/Comments.astro` renders nothing at all when comments are disabled — no
   empty section, no wasted request.

This only wires up configuration; it does not set up or host anything.

## Site URL placeholder

`src/config/site.ts` exports `SITE_URL`, currently `https://example.com`. It's the single source
of truth for canonical URLs, Open Graph tags, JSON-LD, the sitemap, and the RSS feed — update it
in one place before deploying:

```ts
export const SITE_URL = 'https://your-real-domain.example';
```

Also update the `Sitemap:` line in `public/robots.txt` to match — it's a static file and can't
read `site.ts` at build time.

This repository does not include any deployment configuration, so updating the URL here has no
effect on where the site is actually hosted; it only affects the URLs the site _generates about
itself_.
