import { expect, test } from "@playwright/test";
import { APP_FILE_PATH } from "./constants";
import { TabsPage } from "./pages/TabsPage";
import { ItemsSectionFragment } from "./pages/ItemsSectionFragment";

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

test.describe("Cards functionality", () => {
  test("The details of a person's card can be read", async ({page}) => {
    const tabsPage = new TabsPage(page);
    const card = await tabsPage.findCardByIndex(2);
    
    const subTotal = await card.getValueFor('Sub-Total');
    const fee = await card.getValueFor('Fee');
    const total = await card.getValueFor('Total');
  
    expect(subTotal).toEqual('7,400.00');
    expect(fee).toEqual('1,125.00');
    expect(total).toEqual('8,525.00');
  });

  test("A new person can be created", async ({page}) => {
    const personName = "Chris";
    const tabsPage = new TabsPage(page);
    await expect(tabsPage.personCards).toHaveCount(5);
    await tabsPage.addPerson(personName);
    await expect(tabsPage.personCards).toHaveCount(6);
    
    const card = await tabsPage.findCardByIndex(5);
    await expect(card.nameInput).toHaveValue(personName);
  });

  test("A person can be removed", async ({page}) => {
    const tabsPage = new TabsPage(page);
    const card = await tabsPage.findCardByIndex(2);
    const personName = await card.nameInput.inputValue();

    await expect(tabsPage.personCards).toHaveCount(5);
    await card.close();
    await expect(tabsPage.personCards).toHaveCount(4);
  });

  test("A person name can be updated", async ({page}) => {
    const tabsPage = new TabsPage(page);
    const card = await tabsPage.findCardByIndex(3);
    
    await expect(card.nameInput).toHaveValue("Jesus");
    await card.setName("Joshua");
    await expect(card.nameInput).toHaveValue("Joshua");
    await tabsPage.selectPerson("Joshua");
  });
});

test.describe("Items functionality", () => {
  test("An item can be created", async ({page}) => {
    const tabsPage = new TabsPage(page);
    await tabsPage.selectPerson("Angie");
    
    const itemsSection = new ItemsSectionFragment(page, tabsPage.itemsSection);
    expect(await itemsSection.getItemsCount()).toEqual(2);
    await itemsSection.addItem("Coca-Cola 300ml", 4000);
    expect(await itemsSection.getItemsCount()).toEqual(3);
    
    const itemData = await itemsSection.getItemByIndex(2);
    expect(itemData.name).toEqual("Coca-Cola 300ml");
    expect(itemData.value).toEqual("4000");
  });

  test("An item can be removed", async ({page}) => {
    const tabsPage = new TabsPage(page);
    await tabsPage.selectPerson("Angie");

    const itemsSection = new ItemsSectionFragment(page, tabsPage.itemsSection);
    expect(await itemsSection.getItemsCount()).toEqual(2);
    await itemsSection.removeItemById("3");
    expect(await itemsSection.getItemsCount()).toEqual(1);
 
    const itemsData = await itemsSection.getItems();
    const isItemPresent = itemsData.some(item => item.id === "3");
    expect(isItemPresent).toEqual(false);
  });
});
