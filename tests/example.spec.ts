import { test, expect } from '@playwright/test';
import { APP_FILE_PATH } from './constants';
import { TabsPage } from './pages/TabsPage';

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
  await page.goto(`file://${APP_FILE_PATH}`);
  const tabsPage = new TabsPage(page);
  await tabsPage.selectPerson("Jesus");
  await tabsPage.addPerson("Joe");
  await expect(tabsPage.personCards).toHaveCount(6);
  await tabsPage.removePerson('Mary');
  await expect(tabsPage.personCards).toHaveCount(5);
  await tabsPage.updatePersonName('David', 'Dave');
});
