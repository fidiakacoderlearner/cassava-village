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
    // Buka dropdown via trigger (stabil, terlepas dari label aktif)
    await this.page.locator('[data-testid="class-dropdown-trigger"]').click();
    // Pilih opsi kelas yang diminta
    await this.page
      .locator('[data-testid="class-option"]', { hasText: className })
      .first()
      .click({ timeout: 5000 });
    // Tunggu data kelas termuat
    await this.page.waitForTimeout(1500);
  }

  async viewStudentAnswers(studentName: string) {
    await this.page.click(`text=${studentName}`);
    await this.page.click('text=Lihat Jawaban');
  }

  async expectModal() {
    await expect(this.page.locator('[role="dialog"]').or(this.page.locator('.fixed.inset-0')).first()).toBeVisible({ timeout: 5000 });
  }

  async closeModal() {
    await this.page.click('text=Close, text=Tutup');
  }

  async kickStudent(studentName: string) {
    const row = this.page.locator('tr').filter({ hasText: studentName });
    await row.locator('button').last().click();
    await this.page.click('text=Keluarkan, text=Kick Out');
  }

  async deleteClass() {
    await this.page.click('[title="Delete class"], [title="Hapus kelas"]');
    await this.page.click('text=Delete, text=Hapus');
  }

  async createClass(name: string) {
    await this.page
      .locator('button:has-text("+ Create class"), button:has-text("+ Buat Kelas")')
      .first()
      .click();
    // Modal ConfirmationModal: input children dirender di dalam overlay .fixed
    const input = this.page.locator('.fixed input[type="text"]').first();
    await input.waitFor({ state: 'visible', timeout: 10000 });
    await input.fill(name);
    // Tombol konfirmasi ("Buat"/"Create") di dalam modal
    await this.page
      .locator('.fixed button:has-text("Buat"), .fixed button:has-text("Create")')
      .first()
      .click();
  }

  async expectStudentCount(expected: number) {
    const rows = this.page.locator('tbody tr');
    await expect(rows).toHaveCount(expected, { timeout: 5000 });
  }
}
