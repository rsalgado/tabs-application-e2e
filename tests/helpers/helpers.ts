import { TabsPage } from "../pages/TabsPage";

export async function createCardWithItems(tabsPage: TabsPage, personName: string, items: {name: string, value: number}[]): Promise<void>{
  await tabsPage.addPerson(personName);
  await tabsPage.selectPerson(personName); 

  for (let item of items) {
    await tabsPage
            .itemsSectionFragment
            .addItem(item.name, item.value);
  }
}
