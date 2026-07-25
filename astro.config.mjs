// @ts-check
import { unified } from '@astrojs/markdown-remark';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { defineConfig } from 'astro/config';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import rehypeKatex from 'rehype-katex';
import rehypeSlug from 'rehype-slug';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';

import { remarkCallouts } from './src/lib/remarkCallouts.ts';
import { rehypeFigures, rehypeTaskListLabels, rehypeWrapTables } from './src/lib/rehypeFigures.ts';
import { SITE_URL } from './src/config/site.ts';

/**
 * Reads a `title="..."` attribute out of a fenced code block's meta string
 * (e.g. ` ```ts title="app.ts" `) and exposes it as `data-title` on the
 * rendered `<pre>` so `code.css` can render a file-title label bar. Also
 * exposes the language as `data-lang` for the same purpose.
 * @returns {import('shiki').ShikiTransformer}
 */
function shikiCodeMetaTransformer() {
  return {
    name: 'site:code-meta',
    pre(node) {
      const raw = this.options.meta?.__raw;
      const match = raw ? /title=(?:"([^"]*)"|'([^']*)')/.exec(raw) : null;
      const title = match?.[1] ?? match?.[2];
      if (title) {
        node.properties['data-title'] = title;
      }
      if (this.options.lang) {
        node.properties['data-lang'] = this.options.lang;
      }
    },
  };
}

// NOTE: SITE_URL is a placeholder. Update src/config/site.ts before deploying
// so that the sitemap, RSS feed, canonical URLs, and Open Graph tags resolve
// to the real production domain. See docs/CUSTOMIZATION.md.
export default defineConfig({
  site: SITE_URL,
  output: 'static',
  trailingSlash: 'never',

  // Prefetch only on hover/tap-intent to keep network usage reasonable
  // instead of eagerly prefetching every link on the page.
  prefetch: {
    prefetchAll: false,
    defaultStrategy: 'hover',
  },

  integrations: [
    mdx(),
    sitemap({
      filter: (page) => !page.includes('/404'),
    }),
  ],

  markdown: {
    syntaxHighlight: 'shiki',
    shikiConfig: {
      // Code blocks are always rendered on a dark surface (see code.css),
      // independent of the site's own light/dark theme toggle — matching
      // common technical-blog conventions where syntax highlighting themes
      // are tuned for a single dark background rather than swapped per site
      // theme.
      theme: 'github-dark-dimmed',
      wrap: false,
      transformers: [shikiCodeMetaTransformer()],
    },
    // gfm is applied explicitly via remark-gfm below rather than unified()'s
    // built-in default, so it runs exactly once through a known plugin.
    processor: unified({
      gfm: false,
      remarkPlugins: [remarkGfm, remarkMath, remarkCallouts],
      rehypePlugins: [
        rehypeFigures,
        rehypeWrapTables,
        rehypeTaskListLabels,
        rehypeSlug,
        [
          rehypeAutolinkHeadings,
          {
            behavior: 'append',
            properties: {
              className: ['heading-anchor'],
              ariaHidden: 'true',
              tabIndex: -1,
            },
            content: {
              type: 'element',
              tagName: 'span',
              properties: { className: ['heading-anchor-icon'] },
              children: [{ type: 'text', value: '#' }],
            },
          },
        ],
        [rehypeKatex, { output: 'html', throwOnError: false, strict: 'ignore' }],
      ],
    }),
  },

  vite: {
    css: {
      devSourcemap: true,
    },
  },
});
