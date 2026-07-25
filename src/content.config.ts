import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { defineCollection } from 'astro:content';

import { siteConfig } from './config/site';
import { githubApprovedReposLoader } from './lib/githubProjectsLoader';

const PROJECT_STATUS = z.enum(['planned', 'in-progress', 'completed', 'archived']);

/**
 * Blog posts live one folder per article:
 *   src/content/blog/<slug>/index.{md,mdx}
 *   src/content/blog/<slug>/images/*
 * The loader's generateId strips the trailing `/index` so the collection
 * entry id (and therefore the URL slug) is just the folder name.
 */
const blog = defineCollection({
  loader: glob({
    pattern: '**/index.{md,mdx}',
    base: './src/content/blog',
    generateId: ({ entry }) => entry.replace(/\/index\.(md|mdx)$/, ''),
  }),
  schema: ({ image }) =>
    z
      .object({
        title: z.string().min(1, 'title is required'),
        description: z.string().min(1, 'description is required'),
        publishedAt: z.coerce.date(),
        updatedAt: z.coerce.date().optional(),
        tags: z.array(z.string().min(1)).nonempty('at least one tag is required'),
        draft: z.boolean().default(false),
        featured: z.boolean().default(false),
        cover: image().optional(),
        coverAlt: z.string().optional(),
        canonicalUrl: z.url().optional(),
        series: z.string().optional(),
        seriesOrder: z.number().int().positive().optional(),
      })
      .superRefine((data, ctx) => {
        if (data.cover && !data.coverAlt) {
          ctx.addIssue({
            code: 'custom',
            message: 'coverAlt is required when cover is set',
            path: ['coverAlt'],
          });
        }
      }),
});

/**
 * Project entries are single files (no per-project folder is required, but
 * one may still be used for local images alongside the markdown file).
 */
const projects = defineCollection({
  loader: glob({
    pattern: '**/*.{md,mdx}',
    base: './src/content/projects',
  }),
  schema: ({ image }) =>
    z
      .object({
        title: z.string().min(1, 'title is required'),
        summary: z.string().min(1, 'summary is required'),
        publishedAt: z.coerce.date(),
        updatedAt: z.coerce.date().optional(),
        tags: z.array(z.string().min(1)).default([]),
        featured: z.boolean().default(false),
        status: PROJECT_STATUS,
        cover: image().optional(),
        coverAlt: z.string().optional(),
        repositoryUrl: z.url().optional(),
        liveUrl: z.url().optional(),
        technologies: z.array(z.string().min(1)).default([]),
      })
      .superRefine((data, ctx) => {
        if (data.cover && !data.coverAlt) {
          ctx.addIssue({
            code: 'custom',
            message: 'coverAlt is required when cover is set',
            path: ['coverAlt'],
          });
        }
      }),
});

/**
 * Auto-synced from GitHub at build time: any public, non-fork repository
 * under `siteConfig.githubUsername` whose README's last line reads
 * "Website: Approved" shows up here automatically. See
 * src/lib/githubProjectsLoader.ts and docs/CUSTOMIZATION.md.
 */
const githubProjects = defineCollection({
  loader: githubApprovedReposLoader({
    username: siteConfig.githubUsername,
    token: process.env.GITHUB_TOKEN,
  }),
  schema: z.object({
    title: z.string(),
    summary: z.string(),
    publishedAt: z.coerce.date(),
    updatedAt: z.coerce.date().optional(),
    tags: z.array(z.string()).default([]),
    featured: z.boolean().default(false),
    status: PROJECT_STATUS.default('completed'),
    repositoryUrl: z.url(),
    liveUrl: z.url().optional(),
    technologies: z.array(z.string()).default([]),
  }),
});

export const collections = { blog, projects, githubProjects };
