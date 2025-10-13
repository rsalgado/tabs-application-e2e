import { Locator, Page } from "@playwright/test";

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
    const cards = await this.personCards.all();
    const cardNames = await Promise.all(
      cards.map(async (card) => await card.locator('.person-header .name').inputValue())
    );

    const cardIndex = cardNames.indexOf(name);
    await cards[cardIndex].click();
  }

  async addPerson(name: string) {
    await this.newPersonForm.getByRole('textbox').fill(name);
    await this.newPersonForm.getByRole('button').click();
  }

  async removePerson(name: string) {
    // TODO: Implement this!
  }
}
