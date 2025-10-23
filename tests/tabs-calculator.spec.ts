import { expect, test } from "@playwright/test";
import { APP_FILE_PATH } from "./constants";
import { TabsPage } from "./pages/TabsPage";
import { ItemsSectionFragment } from "./pages/ItemsSectionFragment";
import { CardFragment } from "./pages/CardFragment";

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
    let card: CardFragment | null = await tabsPage.findCardByIndex(2);
    const personId = await card.getPersonId();

    await expect(tabsPage.personCards).toHaveCount(5);
    await card.close();
    await expect(tabsPage.personCards).toHaveCount(4);
    card = await tabsPage.findCardById(personId);
    expect(card).toBeNull();
  });

  test("A person name can be updated", async ({page}) => {
    const tabsPage = new TabsPage(page);
    const card = await tabsPage.findCardByIndex(3);
    
    await expect(card.nameInput).toHaveValue("Jesus");
    await card.setName("Joshua");
    await expect(card.nameInput).toHaveValue("Joshua");
    await tabsPage.selectPerson("Joshua");
  });

  test("All cards can be removed and the total gets updated correctly", async ({page}) => {
    const tabsPage = new TabsPage(page);
    await expect(tabsPage.personCards).toHaveCount(5);
    await tabsPage.removeAllCards();
    await expect(tabsPage.personCards).toHaveCount(0);

    await expect(tabsPage.total).toHaveText("0.00");
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

  test("An item can updated", async({page}) => {
    const tabsPage = new TabsPage(page);
    await tabsPage.selectPerson("Angie");

    const itemsSection = new ItemsSectionFragment(page, tabsPage.itemsSection);
    const originalFirstRow = await itemsSection.getItemByIndex(0);
    const originalSecondRow = await itemsSection.getItemByIndex(1);

    expect(itemsSection.subTotal).toHaveText("6500");

    await itemsSection.setItemByIndex(0, { name: "Muffin"});
    await itemsSection.setItemByIndex(1, { value: "2000" });

    const firstRow = await itemsSection.getItemByIndex(0);
    expect(firstRow.name).toEqual("Muffin");
    expect(firstRow.value).toEqual(originalFirstRow.value);

    const secondRow = await itemsSection.getItemByIndex(1);
    expect(secondRow.name).toEqual(originalSecondRow.name);
    expect(secondRow.value).toEqual("2000");

    expect(itemsSection.subTotal).toHaveText("4300");
  });
});

test.describe("Guest functionality", () => {
  test("A person's card doesnt show the 'Fee' and 'Total' details rows when the 'Guest?' checkbox is checked", async ({page}) => {
    const tabsPage = new TabsPage(page);
    await tabsPage.removeAllCards();

    await tabsPage.addPerson("Anna");
    const card = await tabsPage.findCardByName("Anna");
    expect(card.isDetailsRowVisible("Sub-Total")).resolves.toBe(true);
    expect(card.isDetailsRowVisible("Fee")).resolves.toBe(true);
    expect(card.isDetailsRowVisible("Total")).resolves.toBe(true);

    await card.setGuest(true);

    expect(card.isDetailsRowVisible("Sub-Total")).resolves.toBe(true);
    expect(card.isDetailsRowVisible("Fee")).resolves.toBe(false);
    expect(card.isDetailsRowVisible("Total")).resolves.toBe(false);
  });

  test("The costs of a guest are spread between the remaining people", async ({page}) => {
    const tabsPage = new TabsPage(page);
    const itemsSection = new ItemsSectionFragment(page, tabsPage.itemsSection);

    await tabsPage.removeAllCards();

    // Add first person (Alice)
    await tabsPage.addPerson("Alice");
    await tabsPage.selectPerson("Alice");
    await itemsSection.addItem("Flavored Soda", 12_000);
    await itemsSection.addItem("Bacon & Cheese Burger", 30_000);
    await expect(itemsSection.subTotal).toHaveText("42000");
    await expect(tabsPage.total).toHaveText("42,000.00");

    // Add second person (Bob)
    await tabsPage.addPerson("Bob");
    await tabsPage.selectPerson("Bob");
    await itemsSection.addItem("Pepsi 600ml", 8_000);
    await itemsSection.addItem("Veggie Pizza", 32_000);
    await expect(itemsSection.subTotal).toHaveText("40000");
    await expect(tabsPage.total).toHaveText("82,000.00");

    // Add third person (Charlie)
    await tabsPage.addPerson("Charlie");
    await tabsPage.selectPerson("Charlie");
    await itemsSection.addItem("Water 500ml", 4_500);
    await itemsSection.addItem("Chicken Wrap", 25_000);
    await expect(itemsSection.subTotal).toHaveText("29500");
    await expect(tabsPage.total).toHaveText("111,500.00");

    // Set Alice as guest
    const aliceCard =  await tabsPage.findCardByName("Alice");
    await aliceCard.setGuest(true);

    // Verify that Bob and Charlie absorbed Alice's costs

    const bobsCard =  await tabsPage.findCardByName("Bob");
    expect(await bobsCard.getValueFor("Sub-Total")).toEqual("40,000.00");
    expect(await bobsCard.getValueFor("Fee")).toEqual("21,000.00");
    expect(await bobsCard.getValueFor("Total")).toEqual("61,000.00");

    const charliesCard =  await tabsPage.findCardByName("Charlie");
    expect(await charliesCard.getValueFor("Sub-Total")).toEqual("29,500.00");
    expect(await charliesCard.getValueFor("Fee")).toEqual("21,000.00");
    expect(await charliesCard.getValueFor("Total")).toEqual("50,500.00");

    await expect(tabsPage.total).toHaveText("111,500.00");
  });
});
