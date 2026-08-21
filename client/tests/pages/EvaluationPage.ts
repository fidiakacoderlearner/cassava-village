import { Page, expect } from '@playwright/test';

export class EvaluationPage {
  constructor(private page: Page) {}

  async expectQuestion() {
    await expect(this.page.locator('text=Soal')).toBeVisible({ timeout: 10000 });
  }

  async answerQuestion(optionIndex: number) {
    const option = this.page.locator('button').filter({ hasText: /^A-E/ }).nth(optionIndex);
    await option.click();
  }

  async clickNext() {
    await this.page.click('text=Next');
  }

  async clickBack() {
    await this.page.click('text=Back');
  }

  async submit() {
    await this.page.click('text=Submit');
  }

  async expectResults() {
    await expect(this.page.locator('text=Your Score')).toBeVisible({ timeout: 10000 });
  }

  async retry() {
    await this.page.click('text=Try again');
  }

  async goHome() {
    await this.page.click('text=Back to Home');
  }
}
