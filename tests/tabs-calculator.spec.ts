import { expect, test } from "@playwright/test";
import { APP_FILE_PATH } from "./constants";
import { TabsPage } from "./pages/TabsPage";
import { CardFragment } from "./pages/CardFragment";
import * as helpers from "./helpers/helpers";

test.beforeEach(async ({page}) => {
  await page.goto(`file://${APP_FILE_PATH}`);
});

test.describe("General Site", () => {
  test("The site has the correct title", async ({page}) => {
    await expect(page).toHaveTitle("Dinner Tab Calculator");
  });

  test("The main sections are visible correctly", async ({page}) => {
    const tabsPage = new TabsPage(page);
    await tabsPage.selectCard("David");
    
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
    await tabsPage.addCard(personName);
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
    await tabsPage.selectCard("Joshua");
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
    await tabsPage.selectCard("Angie");
    
    const itemsSection = tabsPage.itemsSectionFragment
    expect(await itemsSection.getItemsCount()).toEqual(2);
    await itemsSection.addItem("Coca-Cola 300ml", 4000);
    expect(await itemsSection.getItemsCount()).toEqual(3);
    
    const itemData = await itemsSection.getItemByIndex(2);
    expect(itemData.name).toEqual("Coca-Cola 300ml");
    expect(itemData.value).toEqual("4000");
  });

  test("An item can be removed", async ({page}) => {
    const tabsPage = new TabsPage(page);
    await tabsPage.selectCard("Angie");

    const itemsSection = tabsPage.itemsSectionFragment;
    expect(await itemsSection.getItemsCount()).toEqual(2);
    await itemsSection.removeItemById("3");
    expect(await itemsSection.getItemsCount()).toEqual(1);
 
    const itemsData = await itemsSection.getItems();
    const isItemPresent = itemsData.some(item => item.id === "3");
    expect(isItemPresent).toEqual(false);
  });

  test("An item can updated", async({page}) => {
    const tabsPage = new TabsPage(page);
    await tabsPage.selectCard("Angie");

    const itemsSection = tabsPage.itemsSectionFragment;
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

    await tabsPage.addCard("Anna");
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
    const itemsSection = tabsPage.itemsSectionFragment;

    await tabsPage.removeAllCards();

    // Add first person (Alice)
    await helpers.createCardWithItems(tabsPage, "Alice", [
      {name: "Flavored Soda", value: 12_000},
      {name: "Bacon & Cheese Burger", value: 30_000}
    ]);
    await expect(itemsSection.subTotal).toHaveText("42000");
    await expect(tabsPage.total).toHaveText("42,000.00");

    // Add second person (Bob)
    await helpers.createCardWithItems(tabsPage, "Bob", [
      {name: "Pepsi 600ml", value: 8_000},
      {name: "Veggie Pizza", value: 32_000}
    ]);
    await expect(itemsSection.subTotal).toHaveText("40000");
    await expect(tabsPage.total).toHaveText("82,000.00");

    // Add third person (Charlie)
    await helpers.createCardWithItems(tabsPage, "Charlie", [
      {name: "Water 500ml", value: 4_500},
      {name: "Chicken Wrap", value: 25_000}
    ]);
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

  test("Unmarking a guest recalculates the costs correctly", async ({page}) => {
    const tabsPage = new TabsPage(page);
    const itemsSection = tabsPage.itemsSectionFragment;

    await tabsPage.removeAllCards();

    // Add first person (Diana)
    await helpers.createCardWithItems(tabsPage, "Diana", [
      {name: "Lemonade", value: 10_000},
      {name: "Steak", value: 50_000}
    ]);
    await expect(itemsSection.subTotal).toHaveText("60000");
    await expect(tabsPage.total).toHaveText("60,000.00");

    // Add second person (Ethan)
    await helpers.createCardWithItems(tabsPage, "Ethan", [
      {name: "Iced Tea", value: 6_000},
      {name: "Salmon Fillet", value: 44_000}
    ]);
    await expect(itemsSection.subTotal).toHaveText("50000");
    await expect(tabsPage.total).toHaveText("110,000.00");

    // Set Diana as guest
    const dianaCard =  await tabsPage.findCardByName("Diana");
    await dianaCard.setGuest(true);

    // Verify that Ethan absorbed Diana's costs
    const ethansCard =  await tabsPage.findCardByName("Ethan");
    expect(await ethansCard.getValueFor("Sub-Total")).toEqual("50,000.00");
    expect(await ethansCard.getValueFor("Fee")).toEqual("60,000.00");
    expect(await ethansCard.getValueFor("Total")).toEqual("110,000.00");

    await expect(tabsPage.total).toHaveText("110,000.00");

    // Unmark Diana as guest
    await dianaCard.setGuest(false);

    // Verify that costs are back to normal
    expect(await ethansCard.getValueFor("Sub-Total")).toEqual("50,000.00");
    expect(await ethansCard.getValueFor("Fee")).toEqual("0.00");
    expect(await ethansCard.getValueFor("Total")).toEqual("50,000.00");

    await expect(tabsPage.total).toHaveText("110,000.00");
  });

  test("Adding another person while one is marked as guest recalculates the costs correctly", async ({page}) => {
    const tabsPage = new TabsPage(page);

    await tabsPage.removeAllCards();

    // Add first person (Robert)
    await helpers.createCardWithItems(tabsPage, "Robert", [
      {name: "Coffee", value: 10_000},
      {name: "Cheesecake", value: 15_000},
    ]);

    // Add second person (Anna)
    await helpers.createCardWithItems(tabsPage, "Anna", [
      {name: "Tea", value: 8_000},
      {name: "Fruit Salad", value: 12_000},
    ]);

    await expect(tabsPage.total).toHaveText("45,000.00");

    // Set Anna as guest
    const annasCard = await tabsPage.findCardByName("Anna");
    await annasCard.setGuest(true);

    // Verify that Robert absorbed Anna's costs
    const robertsCard = await tabsPage.findCardByName("Robert");
    expect(await robertsCard.getValueFor("Sub-Total")).toEqual("25,000.00");
    expect(await robertsCard.getValueFor("Fee")).toEqual("20,000.00");
    expect(await robertsCard.getValueFor("Total")).toEqual("45,000.00");

    await expect(tabsPage.total).toHaveText("45,000.00");

    // Add thrid person (Ralph)
    await tabsPage.addCard("Ralph");
    const ralphsCard = await tabsPage.findCardByName("Ralph");

    // Verify that costs are recalculated correctly
    expect(await robertsCard.getValueFor("Sub-Total")).toEqual("25,000.00");
    expect(await robertsCard.getValueFor("Fee")).toEqual("10,000.00");
    expect(await robertsCard.getValueFor("Total")).toEqual("35,000.00");

    expect(await ralphsCard.getValueFor("Sub-Total")).toEqual("0.00");
    expect(await ralphsCard.getValueFor("Fee")).toEqual("10,000.00");
    expect(await ralphsCard.getValueFor("Total")).toEqual("10,000.00");

    await expect(tabsPage.total).toHaveText("45,000.00");
  });

  test("Removing a guest recalculates the costs correctly", async ({page}) => {
    const tabsPage = new TabsPage(page);
    await tabsPage.removeAllCards();

    // Add first person (Olivia)
    await helpers.createCardWithItems(tabsPage, "Olivia", [
      {name: "Smoothie", value: 14_000},
      {name: "Pasta", value: 36_000}
    ]);

    // Add second person (Liam)
    await helpers.createCardWithItems(tabsPage, "Liam", [
      {name: "Soda", value: 6_000},
      {name: "Burger", value: 24_000}
    ]);

    const oliviasCard =  await tabsPage.findCardByName("Olivia");
    const liamsCard =  await tabsPage.findCardByName("Liam");
    // Verify initial costs for Liam
    expect(await liamsCard.getValueFor("Fee")).toEqual("0.00");
    expect(await liamsCard.getValueFor("Total")).toEqual("30,000.00");
    await expect(tabsPage.total).toHaveText("80,000.00");

    // Set Olivia as guest and verify Liam's costs are updated to absorb Olivia's costs
    await oliviasCard.setGuest(true);
    expect(await liamsCard.getValueFor("Fee")).toEqual("50,000.00");
    expect(await liamsCard.getValueFor("Total")).toEqual("80,000.00");
    await expect(tabsPage.total).toHaveText("80,000.00");
    // Remove Olivia
    await oliviasCard.close();
    // Verify that Liam's costs are back to normal
    expect(await liamsCard.getValueFor("Fee")).toEqual("0.00");
    expect(await liamsCard.getValueFor("Total")).toEqual("30,000.00");
    await expect(tabsPage.total).toHaveText("30,000.00");
  });
});
