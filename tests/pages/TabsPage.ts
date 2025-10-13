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
    return new CardFragment(this.page, cardLocator);
  }

  async addPerson(name: string) {
    await this.newPersonForm.getByRole('textbox').fill(name);
    await this.newPersonForm.getByRole('button').click();
  }

  async removePerson(name: string) {
    
  }
}
