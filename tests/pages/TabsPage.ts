import { expect, Locator, Page } from "@playwright/test";
import { CardFragment } from "./CardFragment";
import { ItemsSectionFragment } from "./ItemsSectionFragment";

export class TabsPage {
  readonly peopleSection: Locator;
  readonly itemsSection: Locator;
  readonly personCards: Locator;
  readonly newPersonForm: Locator;
  readonly total: Locator;
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
    this.peopleSection = this.page.locator('#people-section');
    this.itemsSection = this.page.locator('#items-section');
    this.personCards = this.peopleSection.locator('.person-card');
    this.newPersonForm = this.page.locator('#person-form');
    this.total = this.page.locator('.grand-total .amount');
  }

  get itemsSectionFragment(): ItemsSectionFragment {
    return new ItemsSectionFragment(this.page, this.itemsSection);
  }

  async selectCard(name: string) {
    const personCard = await this.findCardByName(name);
    await personCard.select();
  }

  async addCard(personName: string) {
    await this.newPersonForm.getByRole('textbox').fill(personName);
    await this.newPersonForm.getByRole('button').click();
    await this.findCardByName(personName);
    await this.page.waitForTimeout(500); // Wait for animations to complete
  }

  async removeCardByName(personName: string) {
    const personCard = await this.findCardByName(personName);
    await personCard.close();
  }

  async removeCardByIndex(cardIndex: number) {
    const personCard = await this.findCardByIndex(cardIndex);
    await personCard.close();
  }

  async updateCardName(oldName: string, newName: string) {
    const personCard = await this.findCardByName(oldName);
    await personCard.setName(newName);
  }

  async updateCardNameByIndex(cardIndex: number, newName: string) {
    const personCard = await this.findCardByIndex(cardIndex);
    await personCard.setName(newName);
  }

  async findCardByName(name: string): Promise<CardFragment> {
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

  async findCardById(personId: string): Promise<CardFragment|null> {
    let cardLocator = this.peopleSection.getByTestId(personId);
    let elementsCount = await cardLocator.count();
    if (elementsCount === 0)  return null;
    return new CardFragment(this.page, cardLocator);
  }

  async removeAllCards() {
    // Get all card IDs first to avoid locator issues while removing cards one by one due to indices shifting
    const cards = await this.personCards.all();
    const cardIds = await Promise.all(
      cards.map(c => c.getAttribute('data-testid') as unknown as string)
    );

    for (let cardId of cardIds) {
      let card =  await this.findCardById(cardId) as CardFragment;
      await card.close();
    }
  }
}
