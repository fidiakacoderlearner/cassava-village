import { Page, expect } from '@playwright/test';

export class LoginPage {
  constructor(private page: Page) {}

    async goto() {
    await this.page.goto('/login');
    await this.page.waitForLoadState('domcontentloaded');
    // Wait for React app to render — valid browser selectors only
    try {
      await this.page.waitForSelector('body', { timeout: 10000 });
      await this.page.waitForFunction(() => {
        return !!(
          document.querySelector('input[type="email"]') ||
          document.querySelector('input[type="password"]') ||
          document.querySelector('form')
        );
      }, { timeout: 60000 });
    } catch (e) {
      // If waitForFunction fails, fall back to body presence
      await this.page.waitForSelector('body', { timeout: 5000 });
    }
  }

  async fillSignup(name: string, email: string, password: string) {
    const signupBtn = this.page.locator('button:has-text("Sign up"), button:has-text("Daftar")').first();
    await signupBtn.click();
    await this.page.fill('input[type="text"]', name);
    await this.page.fill('input[type="email"]', email);
    await this.page.fill('input[type="password"]', password);
  }

  async fillLogin(email: string, password: string) {
    await this.page.fill('input[type="email"]', email);
    await this.page.fill('input[type="password"]', password);
  }

  async submitLogin() {
    await this.page.click('button[type="submit"]');
  }

  async signupStudent(name: string, email: string, password: string, classCode: string) {
    await this.goto();
    await this.fillSignup(name, email, password);
    await this.page.fill('input[maxlength="8"]', classCode);
    await this.submitLogin();
  }

  async signupTeacher(name: string, email: string, password: string) {
    await this.goto();
    await this.page.click('button:has-text("Sign up"), button:has-text("Daftar")');
    await this.page.click('text=Teacher, text=Guru');
    await this.page.fill('input[type="text"]', name);
    await this.page.fill('input[type="email"]', email);
    await this.page.fill('input[type="password"]', password);
    await this.submitLogin();
  }

  async login(email: string, password: string) {
    await this.goto();
    await this.fillLogin(email, password);
    await this.submitLogin();
  }

  async expectJoinClassForm() {
    await expect(this.page.locator('text=Gabung Kelas, text=Join a Class')).toBeVisible({ timeout: 10000 });
  }

  async joinClass(code: string) {
    await this.page.fill('input[placeholder*="Kode kelas"]', code);
    await this.page.click('button[type="submit"]');
  }
}