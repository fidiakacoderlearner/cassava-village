import { Page, expect } from '@playwright/test';

export class AboutPage {
  constructor(private page: Page) {}

  async expectSections() {
    await expect(this.page.locator('text=Capaian Pembelajaran')).toBeVisible({ timeout: 10000 });
    await expect(this.page.locator('text=Tujuan Pembelajaran')).toBeVisible();
  }

  async openSection(sectionText: string) {
    const btn = this.page.locator(`text=Read`).or(this.page.locator(`text=Baca`));
    const section = this.page.locator(`text=${sectionText}`).first();
    await section.click();
  }

  async goBack() {
    await this.page.click('text=Back, text=Kembali');
  }
}
