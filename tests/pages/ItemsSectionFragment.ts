import { Page, Locator } from '@playwright/test';

interface Item {
  id: string;
  name: string;
  value: string;
}

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
    this.subTotal = itemsSection.locator('.subtotal .amount');
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

  async getItemById(rowId: string): Promise<Item> {
    const itemRow = this.itemsRows.getByTestId(rowId);
    const name = await itemRow.locator('.name').inputValue();
    const value = await itemRow.locator('.value').inputValue();
    return {id: rowId, name, value };
  }

  async getItemByIndex(rowIndex: number): Promise<Item> {
    const itemRow = this.itemsRows.locator('.item-row').nth(rowIndex);
    const id = await itemRow.getAttribute('data-testid') as string;
    const name = await itemRow.locator('.name').inputValue();
    const value = await itemRow.locator('.value').inputValue();
    return { id, name, value };
  }

  async getItems(): Promise<Item[]> {
    let itemsData: {id: string, name: string, value: string}[] = [];

    for (let itemLocator of await this.itemsRows.locator('.item-row[data-testid]').all()) {
      const id = await itemLocator.getAttribute('data-testid') as string;
      const name = await itemLocator.locator('.name').inputValue();
      const value = await itemLocator.locator('.value').inputValue();

      itemsData.push({id, name, value});
    }

    return itemsData;
  }

  async removeItemById(rowId: string) {
    const itemRow = this.itemsRows.getByTestId(rowId);
    await itemRow.getByRole('button').click();
  }

  async getItemsCount(): Promise<number> {
    return await this.itemsRows.locator('.item-row[data-testid]').count();
  }

  async setItemByIndex(rowIndex: number, itemData: { name?: string; value?: string }) {
    const itemRow = this.itemsRows.locator('.item-row').nth(rowIndex);
    // Only fill if values are provided
    if (itemData.name !== undefined) {
      await itemRow.locator('.name').clear();
      await itemRow.locator('.name').fill(itemData.name);
      await itemRow.locator('.name').press('Enter');
    }
    if (itemData.value !== undefined) {
      await itemRow.locator('.value').clear();
      await itemRow.locator('.value').fill(itemData.value);
      await itemRow.locator('.value').press('Enter');
    }
  }
}
