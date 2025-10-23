import { Locator, Page } from '@playwright/test';

export class CardFragment {
  readonly page: Page;
  readonly card: Locator;
  readonly nameInput: Locator;
  readonly closeButton: Locator;
  readonly guestCheckbox: Locator;
  readonly detailsRows: Locator;

  constructor(page: Page, card: Locator) {
    this.page = page;
    this.card = card;
    this.nameInput = card
      .locator('.person-header')
      .getByRole('textbox');

    this.closeButton = card
      .locator('.person-header')
      .getByRole('button');

    this.guestCheckbox = card
      .locator('.details-row')
      .filter({hasText: 'Guest?'})
      .getByRole('checkbox');

    this.detailsRows = card.locator('.details-row');
  }

  async select() {
    await this.card.click();
  }

  async getValueFor(rowName: string): Promise<string> {
    const regExp = new RegExp(`^${rowName}\:`, 'i');
    const value = await 
            this.detailsRows
              .filter({ hasText: regExp})
              .locator('.value')
              .textContent();
    return value ?? '';
  }

  async isDetailsRowVisible(rowName: string) {
    const regExp = new RegExp(`^${rowName}\:`, 'i');
    const row = this.detailsRows.filter({ hasText: regExp});
    return await row.isVisible();
  }

  async isGuest() {
    return this.guestCheckbox.isChecked();
  }

  async setGuest(isGuest: boolean) {
    if (isGuest)  await this.guestCheckbox.check();
    else          await this.guestCheckbox.uncheck();
  }

  async setName(name: string) {
    await this.nameInput.clear();
    await this.nameInput.fill(name);
    await this.nameInput.press('Enter');
  }

  async toggleGuestCheckbox(value: boolean) {
    if (value)  await this.guestCheckbox.check();
    else        await this.guestCheckbox.uncheck();
  }

  async close() {
    await this.closeButton.click();
  }

  async getPersonId() {
    return await this.card.getAttribute('data-testid') as string;
  }
}