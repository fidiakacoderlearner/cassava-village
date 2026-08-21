import { Page, expect } from '@playwright/test';

export class HomePage {
  constructor(private page: Page) {}

  async expectVisible() {
    await expect(this.page.locator('text=Hi,')).toBeVisible({ timeout: 10000 });
  }

  async expectCards() {
    await expect(this.page.locator('text=About')).toBeVisible();
    await expect(this.page.locator('text=Exploration')).toBeVisible();
    await expect(this.page.locator('text=Evaluation')).toBeVisible();
  }

  async clickCard(name: string) {
    const card = this.page.locator(`text=${name}`).first();
    await card.click();
  }

  async openAbout() {
    await this.clickCard('About');
    await this.page.waitForURL('/about');
  }

  async openExploration() {
    await this.clickCard('Exploration');
    await this.page.waitForURL('/exploration');
  }

  async openEvaluation() {
    await this.clickCard('Evaluation');
    await this.page.waitForURL('/evaluation');
  }
}
