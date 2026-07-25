import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { getCollection } from 'astro:content';
import { siteConfig } from '../config/site';
import { filterVisible, sortByPublishedDateDesc } from '../lib/content';

export async function GET(context: APIContext) {
  const posts = sortByPublishedDateDesc(
    filterVisible(await getCollection('blog'), import.meta.env.PROD),
  );

  return rss({
    title: siteConfig.seo.defaultTitle,
    description: siteConfig.seo.defaultDescription,
    site: context.site ?? siteConfig.url,
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.publishedAt,
      link: `/blog/${post.id}`,
      categories: post.data.tags,
      customData: `<author>${siteConfig.email} (${siteConfig.name})</author>`,
    })),
    customData: [
      '<language>en-us</language>',
      `<managingEditor>${siteConfig.email} (${siteConfig.name})</managingEditor>`,
      `<webMaster>${siteConfig.email} (${siteConfig.name})</webMaster>`,
    ].join(''),
  });
}
