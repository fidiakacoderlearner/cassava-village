import { test, expect } from '@playwright/test';
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

    // Verify class appears in page
    await expect(page.locator(`text=${className}`)).toBeVisible({ timeout: 5000 });
  });

  test('Teacher: persist last class selection', async ({ page }) => {
    const login = new LoginPage(page);
    const dashboard = new TeacherDashboardPage(page);

    await login.login(TEACHER.email, TEACHER.password);
    await page.waitForURL('/teacher', { timeout: 10000 });

    // Select a class
    await page.click('text=' + CLASS_NAME);

    // Check localStorage saved
    const saved = await page.evaluate(() => localStorage.getItem('cv_last_class_1'));
    expect(saved).toBeTruthy();

    // Reload page - should restore same class
    await page.reload();
    await page.waitForSelector('text=Dashboard Guru', { timeout: 10000 });

    // The class should still be selected (visible in dropdown)
    await expect(page.locator('text=' + CLASS_NAME)).toBeVisible({ timeout: 5000 });
  });

  test('Teacher: view student answers modal', async ({ page }) => {
    const login = new LoginPage(page);
    const dashboard = new TeacherDashboardPage(page);

    await login.login(TEACHER.email, TEACHER.password);
    await page.waitForURL('/teacher', { timeout: 10000 });

    // Select class with students
    await page.click('text=' + CLASS_NAME);
    await page.waitForSelector('text=Githa', { timeout: 5000 });

    // Click view answers for Githa
    const githaRow = page.locator('tr').filter({ hasText: 'Githa' });
    await githaRow.locator('button:text("View answers")').click();

    // Check modal opened with tabs
    await expect(page.locator('text=Exploration')).toBeVisible({ timeout: 5000 });
  });

  test('Teacher: kick student', async ({ page }) => {
    const login = new LoginPage(page);
    const dashboard = new TeacherDashboardPage(page);

    await login.login(TEACHER.email, TEACHER.password);
    await page.waitForURL('/teacher', { timeout: 10000 });

    // Select class
    await page.click('text=' + CLASS_NAME);
    await page.waitForSelector('text=Siti', { timeout: 5000 });

    // Get initial student count
    const initialCount = await page.locator('tbody tr').count();

    // Kick Siti
    const sitiRow = page.locator('tr').filter({ hasText: 'Siti' });
    await sitiRow.locator('button').last().click();
    await page.click('text=Keluarkan');

    // Verify student removed
    await expect(page.locator('tbody tr')).toHaveCount(initialCount - 1, { timeout: 5000 });
  });
});
