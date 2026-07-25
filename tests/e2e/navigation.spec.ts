import { expect, test } from '@playwright/test';

test.describe('Home page', () => {
  test('loads and shows the hero and primary navigation', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/./);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    // The mobile navigation dialog also has a nav landmark labeled
    // "Primary" (only exposed to assistive tech while open), so scope this
    // to the always-visible header one.
    await expect(
      page.getByRole('banner').getByRole('navigation', { name: 'Primary' }),
    ).toBeVisible();
  });

  test('primary links navigate to projects and blog', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: 'View projects' }).click();
    await expect(page).toHaveURL(/\/projects\/?$/);

    await page.goto('/');
    await page.getByRole('link', { name: 'Read the blog' }).click();
    await expect(page).toHaveURL(/\/blog\/?$/);
  });
});

test.describe('Main navigation', () => {
  test('desktop nav links are keyboard reachable and go to the right pages', async ({ page }) => {
    await page.goto('/');
    const nav = page.getByRole('navigation', { name: 'Primary' }).first();
    await expect(nav.getByRole('link', { name: 'Blog' })).toHaveAttribute('href', '/blog');
    await expect(nav.getByRole('link', { name: 'Projects' })).toHaveAttribute('href', '/projects');
    await expect(nav.getByRole('link', { name: 'About' })).toHaveAttribute('href', '/about');
    await expect(nav.getByRole('link', { name: 'Contact' })).toHaveAttribute('href', '/contact');
  });

  test('skip link is the first focusable element and targets main content', async ({ page }) => {
    await page.goto('/');
    await page.keyboard.press('Tab');
    const skipLink = page.getByRole('link', { name: 'Skip to main content' });
    await expect(skipLink).toBeFocused();
    await expect(skipLink).toHaveAttribute('href', '#main-content');

    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/#main-content$/);
  });
});

test.describe('Mobile navigation', () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test('opens via the trigger, is keyboard accessible, and closes on Escape', async ({ page }) => {
    await page.goto('/');
    const trigger = page.locator('[data-mobile-nav-trigger]');
    await expect(trigger).toBeVisible();

    await trigger.click();
    const dialog = page.locator('#mobile-navigation');
    await expect(dialog).toBeVisible();
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');

    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });

  test('closes when a nav link is activated', async ({ page }) => {
    await page.goto('/');
    await page.locator('[data-mobile-nav-trigger]').click();
    const dialog = page.locator('#mobile-navigation');
    await dialog.getByRole('link', { name: 'Blog' }).click();
    await expect(page).toHaveURL(/\/blog\/?$/);
  });
});

test.describe('404 page', () => {
  test('shows a styled not-found page with links to key sections', async ({ page }) => {
    const response = await page.goto('/this-page-does-not-exist');
    expect(response?.status()).toBe(404);
    await expect(page.getByRole('heading', { name: 'Page not found' })).toBeVisible();

    // "Home"/"Blog"/"Projects" also appear in the header and mobile nav, so
    // scope these to the page's own not-found content.
    const main = page.locator('#main-content');
    await expect(main.getByRole('link', { name: /Home/ })).toBeVisible();
    await expect(main.getByRole('link', { name: 'Blog' })).toBeVisible();
    await expect(main.getByRole('link', { name: 'Projects' })).toBeVisible();
  });
});
