import { Locator, Page } from "@playwright/test";
import { CardFragment } from "./CardFragment";

export class TabsPage {
  readonly peopleSection: Locator;
  readonly itemsSection: Locator;
  readonly personCards: Locator;
  readonly newPersonForm: Locator;
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
    this.peopleSection = this.page.locator('#people-section');
    this.itemsSection = this.page.locator('#items-section');
    this.personCards = this.peopleSection.locator('.person-card');
    this.newPersonForm = this.page.locator('#person-form');
  }

  async selectPerson(name: string) {
    const personCard = await this.findCard(name);
    await personCard.select();
  }

  async addPerson(name: string) {
    await this.newPersonForm.getByRole('textbox').fill(name);
    await this.newPersonForm.getByRole('button').click();
    await this.findCard(name);
  }

  async removePerson(name: string) {
    const personCard = await this.findCard(name);
    await personCard.close();
  }

  async removePersonByIndex(cardIndex: number) {
    const personCard = await this.findCardByIndex(cardIndex);
    await personCard.close();
  }

  async updatePersonName(oldName: string, newName: string) {
    const personCard = await this.findCard(oldName);
    await personCard.setName(newName);
  }

  async updatePersonNameByIndex(cardIndex: number, newName: string) {
    const personCard = await this.findCardByIndex(cardIndex);
    await personCard.setName(newName);
  }

  async findCard(name: string): Promise<CardFragment> {
    let cardLocator: Locator | null = null;

    for (let card of await this.personCards.all()) {
      let title = await card.locator('.person-header .name').inputValue();
      if (title === name) {
        cardLocator = card;
        break;
      }
    }

    if (cardLocator === null) throw new Error(`No card found for the name "${name}"`);

    await cardLocator.waitFor({state: 'visible'});
    return new CardFragment(this.page, cardLocator);
  }

  async findCardByIndex(cardIndex: number): Promise<CardFragment> {
    let cardLocator = this.personCards.nth(cardIndex);
    await cardLocator.waitFor({state: 'visible'});
    return new CardFragment(this.page, cardLocator);
  }
}
