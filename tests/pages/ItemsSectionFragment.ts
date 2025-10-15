import { Page, Locator } from '@playwright/test';

export class ItemsSectionFragment {
  readonly page: Page;
  readonly itemsSection: Locator;
  readonly title: Locator;
  readonly subTotal: Locator;
  readonly itemsRows: Locator;
  readonly newItemForm: Locator;

  constructor(page: Page, itemsSection: Locator) {
    this.page = page;
    this.itemsSection = itemsSection;
    this.title = itemsSection.locator('.title');
    this.subTotal = itemsSection.locator('.subtotal');
    this.itemsRows = itemsSection.locator('.items-rows');
    this.newItemForm = itemsSection.locator('#new-item-form');
  }

  async getTitle(): Promise<string> {
    return await this.title.textContent() ?? '';
  }

  async getSubTotal(): Promise<string> {
    return await this.subTotal.textContent() ?? '';
  }

  async addItem(name: string, value: number) {
    await this.newItemForm.locator('.name').fill(name);
    await this.newItemForm.locator('.value').fill(value.toString());
    await this.newItemForm.getByRole('button').click();
  }

  async getItemById(rowId: string): Promise<{name: string, value: string}> {
    const itemRow = this.itemsRows.getByTestId(rowId);
    const name = await itemRow.locator('.name').inputValue();
    const value = await itemRow.locator('.value').inputValue();
    return { name, value };
  }

  async getItemByIndex(rowIndex: number): Promise<{name: string, value: string}> {
    const itemRow = this.itemsRows.nth(rowIndex);
    const name = await itemRow.locator('.name').inputValue();
    const value = await itemRow.locator('.value').inputValue();
    return { name, value };
  }

  async removeItemById(rowId: string) {
    const itemRow = this.itemsRows.getByTestId(rowId);
    await itemRow.getByRole('button').click();
  }

  async getItemsCount(): Promise<number> {
    return await this.itemsRows.locator('.item-row[data-testid]').count();
  }
}
