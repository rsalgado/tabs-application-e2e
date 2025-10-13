import { test, expect } from '@playwright/test';
import path from 'path';

test('has title', async ({ page }) => {
  await page.goto('https://playwright.dev/');

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/Playwright/);
});

test('get started link', async ({ page }) => {
  await page.goto('https://playwright.dev/');

  // Click the get started link.
  await page.getByRole('link', { name: 'Get started' }).click();

  // Expects page to have a heading with the name of Installation.
  await expect(page.getByRole('heading', { name: 'Installation' })).toBeVisible();
});

test('opening the Dinner Tabs Application', async ({page}) => {
  const appFilePath = path.join(__dirname, '..', 'static', 'index.html');
  await page.goto(`file://${appFilePath}`);
});
