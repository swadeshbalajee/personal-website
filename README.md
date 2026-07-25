# Personal Portfolio & Technical Blog

A static-first personal portfolio and technical blog built with [Astro](https://astro.build).
Content is authored in Markdown/MDX (comfortably, from Obsidian if you like), rendered at build
time, and served as plain HTML/CSS with a deliberately small amount of client-side JavaScript.

This repository is source code and local tooling only. **It intentionally contains no deployment
configuration** — see [Known intentional limitations](#known-intentional-limitations).

## Features

- Markdown and MDX blog posts, with a per-post folder for co-located local images.
- Inline and block LaTeX via build-time KaTeX (no client-side math runtime).
- Syntax-highlighted code blocks (Shiki) with copy-to-clipboard buttons and optional file-title
  labels.
- GitHub-flavored Markdown: tables, task lists, strikethrough, autolinks, footnotes.
- Obsidian-style callouts (`> [!NOTE]`, `> [!WARNING]`, …) via a local remark plugin — no
  third-party callout package.
- Reusable MDX components: `Callout`, `Figure`, `MetricsGrid`, `Steps`.
- Table of contents (collapsible, active-section highlighting), reading time, reading-progress
  bar, previous/next navigation, related articles by tag overlap.
- Tags with dedicated per-tag pages, an all-tags index, and a year-grouped archive.
- Projects section with status, technologies, and repository/live links.
- Projects auto-synced from GitHub at build time: any public repo whose README ends with
  "Website: Approved" shows up automatically — see `docs/CUSTOMIZATION.md`.
- Static search via [Pagefind](https://pagefind.app/) — a search dialog (⌘K / Ctrl+K / `/`) and a
  dedicated `/search` page.
- RSS feed, XML sitemap, `robots.txt`.
- Light/dark/system theme with no flash on load, persisted via `localStorage`.
- SEO: per-page Open Graph + Twitter card metadata, canonical URLs, JSON-LD (WebSite, Person,
  BlogPosting, breadcrumbs) — all derived from one central config, no hardcoded production URLs.
- Optional Giscus comments, disabled by default (no repository configured out of the box).
- Accessible by default: skip link, keyboard-accessible nav and search, visible focus states,
  reduced-motion support, semantic callouts/tables.

## Technology stack

- [Astro](https://astro.build) (static output, no server adapter) + TypeScript (strict mode)
- Astro Content Collections (the Content Layer `glob()` loader) with Zod schema validation
- `@astrojs/mdx`, `@astrojs/sitemap`, `@astrojs/rss`
- `remark-gfm`, `remark-math`, `rehype-katex`, `rehype-slug`, `rehype-autolink-headings`
- A local remark plugin for Obsidian-style callouts (`src/lib/remarkCallouts.ts`)
- KaTeX, Astro's built-in Shiki syntax highlighting
- Pagefind for static search
- Vanilla CSS with custom properties (no Tailwind/Bootstrap/UI framework)
- Vanilla TypeScript modules for theme, search, code-copy, reading progress, mobile nav
- Vitest (unit tests), Playwright + `@axe-core/playwright` (e2e + accessibility tests)
- ESLint (flat config, `typescript-eslint` + `eslint-plugin-astro`) and Prettier
  (`prettier-plugin-astro`)

No React/Vue/Svelte, no Tailwind/Bootstrap/Material UI, no client-side rendering for normal pages,
no database or CMS backend, and no external font requests (system font stacks only).

## Prerequisites

- Node.js ≥ 22.12
- npm ≥ 9.6

## Local installation

```bash
npm install
```

## Development

```bash
npm run dev
```

Starts the Astro dev server (default: `http://localhost:4321`). Draft posts (`draft: true`) are
visible in dev with a "Draft" badge, and excluded from production builds.

## Build

```bash
npm run build
```

Runs `astro build` (static output to `dist/`) followed by `pagefind --site dist` to generate the
search index. **Search only works against a production build** — `/pagefind/pagefind.js` doesn't
exist until this has run at least once.

```bash
npm run preview
```

Serves the built `dist/` folder locally so you can check the real production output (including
search).

## Other commands

| Command                    | Purpose                                                       |
| -------------------------- | ------------------------------------------------------------- |
| `npm run check`            | Astro + TypeScript type checking (`astro check`)              |
| `npm run lint`             | ESLint over the whole repo                                    |
| `npm run lint:fix`         | ESLint with autofix                                           |
| `npm run format`           | Prettier, writing changes                                     |
| `npm run format:check`     | Prettier, check-only (used in validation)                     |
| `npm run test`             | Vitest unit tests, single run                                 |
| `npm run test:watch`       | Vitest unit tests, watch mode                                 |
| `npm run test:e2e`         | Playwright end-to-end tests (builds + previews automatically) |
| `npm run test:e2e:install` | Installs the Chromium browser Playwright needs                |

## Folder structure

```text
src/
├── assets/          Non-content static assets processed by Vite
├── components/       Astro components (blog/, common/, mdx/, and top-level shared components)
├── config/site.ts    Central site configuration — name, nav, social, SEO defaults, comments
├── content/           Blog posts and projects (Content Collections)
├── content.config.ts  Zod schemas for the blog/projects collections
├── layouts/           BaseLayout, ArticleLayout, ProjectLayout
├── lib/                Small, mostly pure utility modules (dates, tags, reading time, SEO, ...)
├── pages/              File-based routes, including the RSS feed and dynamic blog/project/tag routes
├── scripts/            Vanilla TypeScript modules (theme, search, code-copy, reading-progress)
└── styles/             CSS custom properties + global/article/code/utility stylesheets
tests/
├── unit/       Vitest tests for src/lib
└── e2e/        Playwright tests (navigation, blog, theme, accessibility)
docs/
├── AUTHORING.md        Frontmatter reference, Markdown/MDX/LaTeX/callout/code examples
├── OBSIDIAN_SETUP.md   Vault setup for writing posts in Obsidian
└── CUSTOMIZATION.md    What to edit for name/bio/colors/SEO/comments/etc.
```

## Content authoring overview

Posts live under `src/content/blog/<slug>/index.md` (or `.mdx`), with a co-located `images/`
subfolder. Projects live under `src/content/projects/<slug>.md`. Full frontmatter references and
Markdown/MDX/LaTeX/callout/code examples are in [docs/AUTHORING.md](docs/AUTHORING.md); Obsidian
vault setup is in [docs/OBSIDIAN_SETUP.md](docs/OBSIDIAN_SETUP.md).

## Customization overview

Name, bio, email, social links, navigation, accent color, SEO defaults, and Giscus configuration
are all centralized — see [docs/CUSTOMIZATION.md](docs/CUSTOMIZATION.md) for exactly where to edit
each one. Projects normally come from `src/content/projects/`, but that folder is currently empty
in this repository — see "Auto-synced GitHub projects" in `docs/CUSTOMIZATION.md` for the other
source Projects pulls from.

## Known intentional limitations

- **No deployment configuration of any kind.** No Dockerfile, no CI/CD workflows, no
  Vercel/Netlify/Cloudflare/hosting-provider config, no DNS or production environment setup. This
  is deliberate — the repository is meant to be deployment-target-agnostic. Wire up hosting
  yourself once you've chosen a provider.
- `SITE_URL` in `src/config/site.ts` (and the matching line in `public/robots.txt`) is a
  placeholder (`https://example.com`). Update it before you care about canonical URLs, the
  sitemap, or the RSS feed being correct.
- Pagefind search only works against the production build output — it does nothing meaningful
  during `astro dev`.
- Comments (Giscus) are disabled out of the box because they need a real GitHub repository's
  identifiers, which can't be known in advance.
- The bundled `public/social-card.svg` is an SVG placeholder; some social platforms' link-preview
  crawlers render OG images more reliably as PNG/JPG — consider swapping it before relying on it.
- The one sample blog post (`src/content/blog/qlora-sre-example/`) uses illustrative example data
  and clearly marks any numbers as illustrative rather than measured — replace it with your own.
  `src/content/projects/` is currently empty; local projects go there when you add them.
- The GitHub-auto-synced projects feature (see `docs/CUSTOMIZATION.md`) makes real network calls
  to the GitHub API during `npm run dev` and `npm run build`. It fails gracefully (zero synced
  projects, a logged warning) if the network or GitHub is unavailable, but both commands do now
  depend on network access to run at full fidelity.

## Website listing

This repository doubles as the live demo for its own GitHub-auto-sync feature: once pushed
publicly, the lines below are what make it show up under Projects on the site. `Status` and
`Featured` are read from here — see "Auto-synced GitHub projects" in `docs/CUSTOMIZATION.md`.

Status: in-progress
Featured: true

Website: Approved
