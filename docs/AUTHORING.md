# Authoring guide

This is the reference for writing content in this repository: frontmatter fields, Markdown/MDX
features, and the local workflow for drafting and validating a post before it's ready.

This guide intentionally stops at "the content is written and validated locally." It does not
cover publishing or deployment — see the root [README.md](../README.md) for why that's excluded.

## Where content lives

```text
src/content/
├── blog/
│   └── <slug>/
│       ├── index.md   (or index.mdx)
│       └── images/
│           └── *.svg, *.png, *.jpg, ...
└── projects/
    └── <slug>.md
```

Each blog post is a folder so its images can live alongside it. Projects are single files.

## Filename and slug conventions

- Use lowercase, hyphen-separated folder/file names: `qlora-sre-example`, `my-new-project`.
- The folder name (blog) or filename without extension (projects) becomes the URL slug:
  `src/content/blog/qlora-sre-example/index.mdx` → `/blog/qlora-sre-example`.
- Don't rename a published slug later — it changes the article's URL and breaks existing links.
  If you must, set `canonicalUrl` and consider a note in the article.

## Blog frontmatter reference

```yaml
---
title: 'Required. Plain text, used in <title>, cards, and JSON-LD.'
description: 'Required. One or two sentences, used for previews and SEO.'
publishedAt: 2026-02-10 # Required. YYYY-MM-DD.
updatedAt: 2026-03-01 # Optional. Only set this when you materially revise the post.
tags: ['astro', 'performance'] # Required, at least one.
draft: false # Optional, defaults to false. See "Draft workflow" below.
featured: false # Optional, defaults to false. Shown on the homepage/blog index.
cover: ./images/cover.svg # Optional. Path relative to this file.
coverAlt: 'Description of the cover image' # Required if `cover` is set.
canonicalUrl: 'https://example.com/original-post' # Optional. Use for cross-posted content.
series: 'Series name' # Optional.
seriesOrder: 1 # Optional. Only meaningful alongside `series`.
---
```

## Project frontmatter reference

```yaml
---
title: 'Required.'
summary: 'Required. One or two sentences.'
publishedAt: 2026-01-15 # Required.
updatedAt: 2026-07-01 # Optional.
tags: ['astro', 'typescript'] # Optional, defaults to [].
featured: false # Optional, defaults to false.
status: in-progress # Required: planned | in-progress | completed | archived.
cover: ./images/cover.svg # Optional.
coverAlt: 'Description of the cover image' # Required if `cover` is set.
repositoryUrl: 'https://github.com/your-username/your-repo' # Optional.
liveUrl: 'https://example.com' # Optional.
technologies: ['Astro', 'TypeScript'] # Optional, defaults to [].
---
```

## Markdown examples

Standard GitHub-flavored Markdown is supported: tables, task lists, strikethrough, autolinks,
footnotes, and automatic heading anchors.

```markdown
## A heading

Regular paragraph with **bold**, _italic_, and `inline code`. A bare URL like
https://example.com is auto-linked. ~~Struck through~~ text works too.

- [x] Done
- [ ] Not done yet

| Column | Another column |
| ------ | -------------- |
| a      | b              |

A sentence with a footnote.[^1]

[^1]: The footnote text, rendered at the bottom of the article.
```

## MDX examples

Use `.mdx` instead of `.md` when you need one of the reusable components below. Import them at
the top of the file, after the frontmatter:

```mdx
import Callout from '../../../components/mdx/Callout.astro';
import Figure from '../../../components/mdx/Figure.astro';
import MetricsGrid from '../../../components/mdx/MetricsGrid.astro';
import Steps from '../../../components/mdx/Steps.astro';
```

The relative path has three `../` segments because a post lives at
`src/content/blog/<slug>/index.mdx` and the components live at `src/components/mdx/`.

### Callout

```mdx
<Callout type="warning" title="Optional custom title">
  Body content, written as normal Markdown/MDX.
</Callout>
```

`type` is one of `note`, `tip`, `info`, `warning`, `danger`, `success`, `question`, `example`. If
you don't need a custom title, omit it and the type's default label is used. For most callouts
you don't need this component at all — see the Obsidian-style callout syntax below, which works
in plain `.md` files too.

### Figure

Unlike a plain Markdown image, `Figure` needs an **imported** image reference (not a bare string
path), so Astro can optimize it:

```mdx
import diagram from './images/architecture.svg';

<Figure src={diagram} alt="Describe what the diagram shows" caption="Optional caption text." />
```

### MetricsGrid

For a small grid of labeled numbers — make sure to mark illustrative/example values as such:

```mdx
<MetricsGrid
  note="These are illustrative configuration values, not measured results."
  metrics={[
    { label: 'LoRA rank (r)', value: '16', description: 'Example configuration value' },
    { label: 'Base precision', value: '4-bit (NF4)' },
  ]}
/>
```

### Steps

Wraps a normal numbered Markdown list with connected step styling:

```mdx
<Steps>1. First step. 2. Second step. 3. Third step.</Steps>
```

## LaTeX examples

Inline math uses single dollar signs; block math uses double dollar signs. Both are rendered to
static HTML/CSS at build time with KaTeX — no client-side math runtime is shipped.

```markdown
Inline: $E = mc^2$

Block:

$$
\mathcal{L}(\theta) = -\sum_{i=1}^{n} \log p_\theta(y_i \mid x_i)
$$
```

Long equations scroll horizontally on narrow screens instead of overflowing the page.

## Image examples

Place images in an `images/` subfolder next to the post and reference them with a relative path:

```markdown
![Architecture of the system](./images/architecture.svg)
```

To add a caption, add a quoted title after the path — it's rendered as a `<figcaption>`:

```markdown
![Architecture of the system](./images/architecture.svg 'The request flow through the application.')
```

Local images are picked up by Astro's built-in image pipeline automatically: explicit width and
height (no layout shift), lazy loading below the fold, and no external hotlinking.

## Callout examples (Obsidian-style)

This works directly in `.md` files, no import needed — a local remark plugin
(`src/lib/remarkCallouts.ts`) converts the blockquote syntax into the same styled callout used by
the `<Callout>` MDX component:

```markdown
> [!NOTE]
> A note.

> [!WARNING] Custom title
> An important warning with a custom title.

> [!TIP]
> A helpful tip.
```

Supported types: `note`, `tip`, `info`, `warning`, `danger`, `success`, `question`, `example`.

## Code examples

Fenced code blocks are syntax-highlighted at build time with Shiki. Add a `title="..."` after the
language to show a file-name label bar and get a copy button:

````markdown
```ts title="src/lib/example.ts"
export function add(a: number, b: number): number {
  return a + b;
}
```
````

## Footnote examples

```markdown
Sentence needing a citation.[^note]

[^note]: The footnote body. Can contain multiple sentences and even other Markdown.
```

## Table examples

```markdown
| Precision | Bytes per parameter |
| --------- | ------------------- |
| FP32      | 4                   |
| FP16      | 2                   |
```

Tables scroll horizontally on narrow screens rather than breaking the page layout.

## Draft workflow

Set `draft: true` in frontmatter to keep a post out of production builds while still being able to
preview it locally:

```bash
npm run dev
```

Draft posts are visible during `astro dev` (with a visible "Draft" badge) but are excluded when
`npm run build` runs in production mode, from the RSS feed, and from the sitemap.

## Publishing-neutral workflow

This repository intentionally stops at "the content exists and validates locally." A typical
authoring loop:

1. Create the post folder and `index.md`/`index.mdx` with frontmatter.
2. Add any images to `images/` alongside it.
3. Run `npm run dev` and review the post, including on mobile widths and in both themes.
4. Run `npm run check`, `npm run lint`, and `npm run test` to catch schema, type, and lint issues.
5. Run `npm run build` to confirm the post builds cleanly and search indexing succeeds.
6. Set `draft: false` when it's ready to ship, and commit the change.

What happens after that (hosting, deployment, DNS) is deliberately outside the scope of this
repository — see the root README.

## Accessibility guidance

- Write alt text that describes what the image conveys, not that it's an image (skip "image of…").
  Purely decorative images can use an empty `alt=""`, but for content images, describe the content.
- Keep heading levels in order within the article body — start at `##` (h2), since the page title
  is already an `<h1>`; don't skip from `##` to `####`.
- Prefer descriptive link text ("see the Astro content collections docs") over "click here."
- When a table communicates data (not just layout), keep the header row (`th`) — screen readers
  use it to announce column context for each cell.
