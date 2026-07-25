import { expect, test } from '@playwright/test';

test.describe('Blog index', () => {
  test('lists articles with dates, reading time, and tags', async ({ page }) => {
    await page.goto('/blog');
    await expect(page.getByRole('heading', { level: 1, name: 'Blog' })).toBeVisible();

    const firstCard = page.locator('.article-card').first();
    await expect(firstCard).toBeVisible();
    await expect(firstCard.locator('time')).toBeVisible();
    await expect(firstCard.getByText(/min read/)).toBeVisible();
  });
});

test.describe('Blog article', () => {
  test('opens an article with title, meta, and body content', async ({ page }) => {
    await page.goto('/blog');
    await page.locator('.article-card__title a').first().click();

    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.locator('[data-article-body]')).toBeVisible();
    await expect(page.locator('.reading-progress')).toBeAttached();
  });

  test('renders inline and block LaTeX with KaTeX', async ({ page }) => {
    await page.goto('/blog/qlora-sre-example');
    await expect(page.locator('[data-article-body] .katex').first()).toBeVisible();
    await expect(page.locator('[data-article-body] .katex-display').first()).toBeVisible();
  });

  test('renders an Obsidian-style callout as accessible markup', async ({ page }) => {
    await page.goto('/blog/qlora-sre-example');
    // .callout-tip comes from the `> [!TIP]` blockquote syntax (the remark
    // plugin), distinct from the `.callout-warning` rendered by the MDX
    // <Callout> component elsewhere on the same page.
    const callout = page.locator('.callout-tip');
    await expect(callout).toBeVisible();
    await expect(callout).toHaveAttribute('role', 'note');
    await expect(callout.locator('.callout-title')).toBeVisible();
  });

  test('renders a table and a local image without broken paths', async ({ page }) => {
    await page.goto('/blog/qlora-sre-example');
    await expect(page.locator('[data-article-body] table').first()).toBeVisible();

    const image = page.locator('[data-article-body] img').first();
    await expect(image).toBeVisible();
    const naturalWidth = await image.evaluate((img: HTMLImageElement) => img.naturalWidth);
    expect(naturalWidth).toBeGreaterThan(0);
  });

  test('renders MDX components (Callout, Figure, MetricsGrid, Steps)', async ({ page }) => {
    await page.goto('/blog/qlora-sre-example');
    await expect(page.locator('.callout-warning')).toBeVisible();
    await expect(page.locator('.figure figcaption')).toBeVisible();
    await expect(page.locator('.metrics-grid__item').first()).toBeVisible();
    await expect(page.locator('.steps')).toBeVisible();
  });

  test('copy-code button copies the code block contents', async ({ page }) => {
    await page.goto('/blog/qlora-sre-example');
    const codeBlock = page.locator('.code-block').first();
    await codeBlock.hover();
    const copyButton = codeBlock.locator('[data-code-copy-button]');
    await copyButton.click();
    await expect(copyButton).toHaveAttribute('data-state', 'copied');
  });

  test('does not show previous/next navigation with only one article published', async ({
    page,
  }) => {
    // With a single post, there's no adjacent article to link to — this
    // guards against the nav rendering empty/broken links in that case.
    await page.goto('/blog/qlora-sre-example');
    await expect(page.locator('.article-nav')).toHaveCount(0);
  });
});

test.describe('Search', () => {
  test('the search page is available and returns results after a production build', async ({
    page,
  }) => {
    await page.goto('/search');
    await expect(page.getByRole('heading', { level: 1, name: 'Search' })).toBeVisible();

    const input = page.locator('.search-page [data-search-input]');
    await input.fill('QLoRA');

    await expect(
      page.locator('.search-page [data-search-results] .search-result').first(),
    ).toBeVisible({
      timeout: 10_000,
    });
  });

  test('shows an empty state for a query with no matches', async ({ page }) => {
    await page.goto('/search');
    const input = page.locator('.search-page [data-search-input]');
    await input.fill('zzzznonexistentqueryzzzz');
    await expect(page.locator('.search-page [data-search-status]')).toContainText(/No results/, {
      timeout: 10_000,
    });
  });
});
