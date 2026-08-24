import { Page, expect } from '@playwright/test';

export class HomePage {
  constructor(private page: Page) {}

  async expectVisible() {
    // Use regex for partial match - the greeting is "Hai, {name}" or "Hi, {name}"
    await expect(this.page.locator('p:has-text("Hai,"), p:has-text("Hi,")')).toBeVisible({ timeout: 10000 });
  }

  async expectCards() {
    await expect(this.page.locator('text=Tentang')).toBeVisible({ timeout: 10000 });
    await expect(this.page.locator('text=Eksplorasi')).toBeVisible({ timeout: 10000 });
    await expect(this.page.locator('text=Evaluasi')).toBeVisible({ timeout: 10000 });
  }

  async clickCard(name: string) {
    const translations: Record<string, string> = {
      'About': 'Tentang',
      'Exploration': 'Eksplorasi',
      'Evaluation': 'Evaluasi',
    };
    const card = this.page.locator(`text=${translations[name] || name}`).first();
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
