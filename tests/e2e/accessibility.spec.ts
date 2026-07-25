import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

const pages = [
  { name: 'home', path: '/' },
  { name: 'blog index', path: '/blog' },
  { name: 'blog article', path: '/blog/qlora-sre-example' },
  { name: 'projects index', path: '/projects' },
  { name: 'publications', path: '/publications' },
  { name: 'tags index', path: '/tags' },
  { name: 'about', path: '/about' },
  { name: 'contact', path: '/contact' },
  { name: 'search', path: '/search' },
  { name: '404', path: '/this-page-does-not-exist' },
];

for (const { name, path } of pages) {
  test(`${name} page has no automatically detectable accessibility violations`, async ({
    page,
  }) => {
    await page.goto(path);
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag22aa'])
      .analyze();

    expect(results.violations, JSON.stringify(results.violations, null, 2)).toEqual([]);
  });
}
