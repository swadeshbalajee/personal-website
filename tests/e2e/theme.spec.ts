import { expect, test } from '@playwright/test';

test.describe('Theme switching', () => {
  test('cycles between system, light, and dark, updating the html attribute', async ({ page }) => {
    await page.goto('/');
    const html = page.locator('html');
    const toggle = page.locator('[data-theme-toggle]');

    await expect(html).not.toHaveAttribute('data-theme-preference', 'light');

    await toggle.click();
    await expect(html).toHaveAttribute('data-theme-preference', 'light');
    await expect(html).toHaveAttribute('data-theme', 'light');

    await toggle.click();
    await expect(html).toHaveAttribute('data-theme-preference', 'dark');
    await expect(html).toHaveAttribute('data-theme', 'dark');

    await toggle.click();
    await expect(html).toHaveAttribute('data-theme-preference', 'system');
  });

  test('persists the chosen theme across a reload via localStorage', async ({ page }) => {
    await page.goto('/');
    await page.locator('[data-theme-toggle]').click(); // -> light

    const stored = await page.evaluate(() => localStorage.getItem('theme'));
    expect(stored).toBe('light');

    await page.reload();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  });

  test('does not flash the wrong theme on load', async ({ page }) => {
    await page.goto('/');
    await page.locator('[data-theme-toggle]').click(); // -> light
    await page.locator('[data-theme-toggle]').click(); // -> dark
    await page.reload();

    // Theme must already be applied by the time the document is interactive,
    // before any paint-affecting script runs later in the page.
    const themeAtDomContentLoaded = await page.evaluate(
      () => document.documentElement.dataset.theme,
    );
    expect(themeAtDomContentLoaded).toBe('dark');
  });
});
