import { TabsPage } from "../pages/TabsPage";
import { ItemsSectionFragment } from "../pages/ItemsSectionFragment";
import { Page } from "@playwright/test";

export async function createCardWithItems(page: Page, personName: string, items: {name: string, value: number}[]): Promise<void>{
  const tabsPage = new TabsPage(page);
  const itemsSection = new ItemsSectionFragment(page, tabsPage.itemsSection);

  await tabsPage.addPerson(personName);
  await tabsPage.selectPerson(personName); 

  for (let item of items) {
    await itemsSection.addItem(item.name, item.value);
  }
}
