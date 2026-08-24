import { test, expect } from '../fixtures';
import { LoginPage } from '../pages/LoginPage';
import { HomePage } from '../pages/HomePage';
import { TeacherDashboardPage } from '../pages/TeacherDashboardPage';
import { TEACHER, CLASS_NAME } from '../fixtures/test-data';

test.describe('Teacher Journey', () => {
  test('Teacher login → dashboard with stats', async ({ page }) => {
    const login = new LoginPage(page);
    const dashboard = new TeacherDashboardPage(page);

    // Login as teacher
    await login.login(TEACHER.email, TEACHER.password);
    await page.waitForURL('/teacher', { timeout: 10000 });

    // Check dashboard loaded
    await dashboard.expectDashboard();
    await dashboard.expectStats();
  });

  test('Teacher: create class', async ({ page }) => {
    const login = new LoginPage(page);
    const dashboard = new TeacherDashboardPage(page);

    await login.login(TEACHER.email, TEACHER.password);
    await page.waitForURL('/teacher', { timeout: 10000 });

    // Create new class
    const className = `Test ${Date.now()}`;
    await dashboard.createClass(className);

    // Verify class appears in page (auto-selected after creation)
    await expect(page.locator(`text=${className}`).first()).toBeVisible({ timeout: 10000 });
  });

  test('Teacher: persist last class selection', async ({ page }) => {
    const login = new LoginPage(page);
    const dashboard = new TeacherDashboardPage(page);

    await login.login(TEACHER.email, TEACHER.password);
    await page.waitForURL('/teacher', { timeout: 10000 });
    await page.waitForTimeout(1000);

    // Select a class via dropdown
    await dashboard.selectClass(CLASS_NAME);

    // Check localStorage saved
    const saved = await page.evaluate(() => localStorage.getItem('cv_last_class_1'));
    expect(saved).toBeTruthy();

    // Reload page - should restore same class
    await page.reload();
    await page.waitForSelector('text=Dashboard Guru', { timeout: 10000 });

    // The class should still be selected (visible in dropdown trigger)
    await expect(page.locator('text=' + CLASS_NAME)).toBeVisible({ timeout: 10000 });
  });

  test('Teacher: view student answers modal', async ({ page }) => {
    const login = new LoginPage(page);
    const dashboard = new TeacherDashboardPage(page);

    await login.login(TEACHER.email, TEACHER.password);
    await page.waitForURL('/teacher', { timeout: 10000 });

    // Select class with students (dropdown)
    await dashboard.selectClass(CLASS_NAME);
    await page.waitForSelector('text=Githa', { timeout: 10000 });

    // Click view answers for Githa
    const githaRow = page.locator('tr').filter({ hasText: 'Githa' });
    await githaRow.locator('button:has-text("View answers"), button:has-text("Lihat jawaban")').first().click();

    // Modal terbuka dan memuat tab Eksplorasi
    await expect(page.locator('.fixed')).toContainText('Eksplorasi', { timeout: 10000 });
  });

  test('Teacher: kick student', async ({ page }) => {
    const login = new LoginPage(page);
    const dashboard = new TeacherDashboardPage(page);

    await login.login(TEACHER.email, TEACHER.password);
    await page.waitForURL('/teacher', { timeout: 10000 });

    // Select class (dropdown)
    await dashboard.selectClass(CLASS_NAME);
    await page.waitForSelector('tbody tr', { timeout: 10000 });

    // Idempoten: jika Siti sudah pernah dikick di run sebelumnya, daftarkan lagi via API
    const sitiVisible = await page
      .locator('tbody tr', { hasText: 'Siti' })
      .first()
      .isVisible()
      .catch(() => false);
    if (!sitiVisible) {
      const rejoin = await page.request.post('http://localhost:5001/api/auth/login', {
        data: { email: 'siti@cassava.com', password: 'siti123' },
      });
      const { token } = await rejoin.json();
      await page.request.post('http://localhost:5001/api/auth/join-class', {
        headers: { Authorization: `Bearer ${token}` },
        data: { classCode: 'DEMOAB' },
      });
      await page.reload();
      await dashboard.selectClass(CLASS_NAME);
    }

    // Cari Siti (29 siswa ter-paginasi 5/halaman — filter agar pasti tampil)
    const searchBox = page.locator('input[placeholder*="Cari"], input[placeholder*="Search"]');
    await searchBox.fill('Siti');
    await page.waitForTimeout(500);

    const sitiRow = page.locator('tbody tr').filter({ hasText: 'Siti' });
    await expect(sitiRow).toHaveCount(1, { timeout: 10000 });

    // Kick Siti via tombol terakhir pada barisnya (ikon tempat sampah)
    await sitiRow.locator('button').last().click();
    // Dialog konfirmasi — tombol "Keluarkan" (exact) di dalam overlay .fixed
    await page.locator('.fixed button:text-is("Keluarkan"), .fixed button:text-is("Remove")').first().click();

    // Verifikasi baris Siti hilang dari hasil filter
    await expect(sitiRow).toHaveCount(0, { timeout: 10000 });
  });
});
