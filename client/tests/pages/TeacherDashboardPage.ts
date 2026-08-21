import { Page, expect } from '@playwright/test';

export class TeacherDashboardPage {
  constructor(private page: Page) {}

  async expectDashboard() {
    await expect(this.page.locator('text=Dashboard Guru')).toBeVisible({ timeout: 10000 });
  }

  async expectStats() {
    await expect(this.page.locator('text=Total murid')).toBeVisible();
    await expect(this.page.locator('text=Baru')).toBeVisible();
    await expect(this.page.locator('text=Berjalan')).toBeVisible();
    await expect(this.page.locator('text=Selesai')).toBeVisible();
  }

  async selectClass(className: string) {
    await this.page.click('text=' + className);
  }

  async viewStudentAnswers(studentName: string) {
    await this.page.click(`text=${studentName}`);
    await this.page.click('text=Lihat Jawaban');
  }

  async expectModal() {
    await expect(this.page.locator('[role="dialog"]').or(this.page.locator('.fixed.inset-0')).first()).toBeVisible({ timeout: 5000 });
  }

  async closeModal() {
    await this.page.click('text=Close');
  }

  async kickStudent(studentName: string) {
    const row = this.page.locator('tr').filter({ hasText: studentName });
    await row.locator('button').last().click();
    await this.page.click('text=Keluarkan');
  }

  async deleteClass() {
    await this.page.click('[title="Delete class"]');
    await this.page.click('text=Delete');
  }

  async createClass(name: string) {
    await this.page.click('text=+ Create class');
    await this.page.fill('input[placeholder*="Class name"]', name);
    await this.page.click('text=Create');
  }

  async expectStudentCount(expected: number) {
    const rows = this.page.locator('tbody tr');
    await expect(rows).toHaveCount(expected, { timeout: 5000 });
  }
}
