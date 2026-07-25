# Writing in Obsidian

This site's content lives in plain Markdown/MDX files under `src/content/`, which makes it
comfortable to author directly in [Obsidian](https://obsidian.md/). This guide covers the vault
setup that keeps Obsidian's output compatible with this site's rendering (in particular, standard
Markdown links instead of Obsidian's `[[wikilink]]` syntax).

## 1. Open the repository (or `src/content/blog`) as a vault

In Obsidian: **File → Open folder as vault**, and choose either the repository root or
`src/content/blog` specifically. Using `src/content/blog` directly is usually more convenient
since every note in the vault is then a real post.

## 2. Disable wikilinks

This site expects standard Markdown links and images (`[text](url)`, `![alt](path)`), not
Obsidian's `[[wikilink]]` shorthand — the Markdown/MDX pipeline (remark/rehype) doesn't understand
the double-bracket syntax.

In Obsidian: **Settings → Files and Links → "Use [[Wikilinks]]"** → turn this **off**. With it
off, Obsidian's own link-paste and autocomplete behavior will produce standard Markdown links.

## 3. Use standard Markdown links

Internal links between posts should be written as normal relative or root-relative links:

```markdown
See the [QLoRA log triage notes](/blog/qlora-sre-example) for more.
```

## 4. Configure attachments to use an `images` subfolder

In Obsidian: **Settings → Files and Links → "Default location for new attachments"** → set to
**"In subfolder under current folder"** and set the subfolder name to `images`.

This matches the content layout this site expects:

```text
src/content/blog/my-post/
├── index.md
└── images/
    └── diagram.png
```

## 5. Paste or drag images into the article folder

With the setting above, dragging or pasting an image into a note automatically saves it to that
note's `images/` subfolder and inserts a Markdown image reference for you.

## 6. Recommended link format

```markdown
![Description](./images/example.png)
```

Do **not** use Obsidian's embed syntax for images:

```text
![[example.png]]
```

It won't render on the site — it depends on Obsidian's own link-resolution, not the Markdown
image syntax that remark/Astro understand.

## 7. Create a new folder per article

Each post needs its own folder so its `images/` subfolder stays self-contained:

```text
src/content/blog/<new-post-slug>/
├── index.md
└── images/
```

## 8. Copy a blog-post template

A minimal starting point for a new post:

```markdown
---
title: 'Post title'
description: 'One or two sentence summary.'
publishedAt: 2026-01-01
tags: ['tag-one']
draft: true
featured: false
---

Start writing here.
```

Save it as `src/content/blog/<slug>/index.md`.

## 9. Preview the finished website locally

From the repository root (not inside Obsidian):

```bash
npm run dev
```

Then open the printed local URL and navigate to `/blog/<slug>` to see the rendered post,
including the "Draft" badge if `draft: true`.

## 10. `.md` vs `.mdx`

- Use `.md` for normal articles — Markdown, images, tables, footnotes, math, and Obsidian-style
  callouts (`> [!NOTE]`) all work in plain Markdown.
- Use `.mdx` only when you need one of the reusable components documented in
  [AUTHORING.md](./AUTHORING.md) (`Callout`, `Figure`, `MetricsGrid`, `Steps`). Obsidian can still
  edit `.mdx` files as plain text; it just won't render the imported components in its own
  preview pane (that's expected — Obsidian doesn't run Astro/MDX).

## Notes and limits

- Obsidian's own preview pane won't perfectly match the site (no site theme, no MDX components
  rendering) — always confirm with `npm run dev` before considering a post finished.
- Obsidian-specific features beyond wikilinks and image embeds (canvases, plugins, dataview
  queries, etc.) are not supported by this site's Markdown pipeline.
