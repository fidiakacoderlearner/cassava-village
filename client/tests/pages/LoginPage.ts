import { Page, expect } from '@playwright/test';

export class LoginPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('/login');
    await this.page.waitForSelector('form');
  }

  async fillSignup(name: string, email: string, password: string) {
    const signupBtn = this.page.locator('text=Sign up').first();
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
    await this.page.click('text=Sign up');
    await this.page.click('text=Teacher');
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
    await expect(this.page.locator('text=Gabung Kelas')).toBeVisible({ timeout: 10000 });
  }

  async joinClass(code: string) {
    await this.page.fill('input[placeholder*="Kode kelas"]', code);
    await this.page.click('button[type="submit"]');
  }
}
