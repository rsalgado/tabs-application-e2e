import { expect, test } from "@playwright/test";
import { APP_FILE_PATH } from "./constants";
import { TabsPage } from "./pages/TabsPage";

test.beforeEach(async ({page}) => {
  await page.goto(`file://${APP_FILE_PATH}`);
});

test.describe("General Site", () => {
  test("The site has the correct title", async ({page}) => {
    await expect(page).toHaveTitle("Dinner Tab Calculator");
  });

  test("The main sections are visible correctly", async ({page}) => {
    const tabsPage = new TabsPage(page);
    await tabsPage.selectPerson("David");
    
    await expect(tabsPage.newPersonForm).toBeVisible();
    await expect(tabsPage.peopleSection).toBeVisible();
    await expect(tabsPage.itemsSection).toBeVisible();
  });
});
