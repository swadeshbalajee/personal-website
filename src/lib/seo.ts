import { siteConfig } from '../config/site';

/** Resolves a path or absolute URL against the configured site URL. */
export function absoluteUrl(path: string): string {
  return new URL(path, siteConfig.url).toString();
}

/** Applies the site-wide title template, e.g. "Blog — Your Name". */
export function resolveTitle(pageTitle?: string): string {
  if (!pageTitle) return siteConfig.seo.defaultTitle;
  return siteConfig.seo.titleTemplate.replace('%s', pageTitle);
}

export interface WebsiteJsonLdOptions {
  name?: string;
  description?: string;
}

export function websiteJsonLd(options: WebsiteJsonLdOptions = {}): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: options.name ?? siteConfig.seo.defaultTitle,
    description: options.description ?? siteConfig.seo.defaultDescription,
    url: siteConfig.url,
  };
}

export function personJsonLd(): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: siteConfig.name,
    jobTitle: siteConfig.title,
    url: siteConfig.url,
    sameAs: siteConfig.social
      .filter((link) => link.icon === 'github' || link.icon === 'linkedin')
      .map((link) => link.href),
  };
}

export interface BlogPostingJsonLdOptions {
  title: string;
  description: string;
  publishedAt: Date;
  updatedAt?: Date;
  url: string;
  image?: string;
  tags: string[];
}

export function blogPostingJsonLd(options: BlogPostingJsonLdOptions): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: options.title,
    description: options.description,
    datePublished: options.publishedAt.toISOString(),
    dateModified: (options.updatedAt ?? options.publishedAt).toISOString(),
    url: options.url,
    image: options.image ? [options.image] : undefined,
    keywords: options.tags.join(', '),
    author: {
      '@type': 'Person',
      name: siteConfig.name,
      url: siteConfig.url,
    },
    publisher: {
      '@type': 'Person',
      name: siteConfig.name,
      url: siteConfig.url,
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': options.url,
    },
  };
}

export interface BreadcrumbItem {
  name: string;
  url: string;
}

export function breadcrumbsJsonLd(items: BreadcrumbItem[]): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}
