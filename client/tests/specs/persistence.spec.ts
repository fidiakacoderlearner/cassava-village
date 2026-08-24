import { test, expect } from '../fixtures';
import { LoginPage } from '../pages/LoginPage';
import { TeacherDashboardPage } from '../pages/TeacherDashboardPage';
import { TEACHER, CLASS_NAME } from '../fixtures/test-data';

test.describe('Persistence & Login Flow', () => {
  test('Teacher: last class persists across sessions', async ({ page }) => {
    const login = new LoginPage(page);
    const dashboard = new TeacherDashboardPage(page);

    // Session 1: Login and select a class
    await login.login(TEACHER.email, TEACHER.password);
    await page.waitForURL('/teacher', { timeout: 10000 });
    await page.waitForTimeout(1000);
    await dashboard.selectClass(CLASS_NAME);
    await page.waitForTimeout(500);

    // Verify localStorage saved
    const saved1 = await page.evaluate(() => localStorage.getItem(`cv_last_class_1`));
    expect(saved1).toBeTruthy();

    // Simulate logout (clear token)
    await page.evaluate(() => localStorage.removeItem('cv_token'));

    // Session 2: Login again
    await login.login(TEACHER.email, TEACHER.password);
    await page.waitForURL('/teacher', { timeout: 10000 });

    // Should restore the last class
    await expect(page.locator('text=' + CLASS_NAME)).toBeVisible({ timeout: 10000 });
  });

  test('Student: class_id persists in localStorage', async ({ page }) => {
    const login = new LoginPage(page);

    await login.login('student@cassava.com', 'student123');
    await page.waitForURL('/', { timeout: 10000 });

    // Check localStorage has class_id
    const userData = await page.evaluate(() => {
      const user = JSON.parse(localStorage.getItem('cv_user') || '{}');
      return user;
    });

    expect(userData.class_id).toBeTruthy();
  });

  test('Student: join class after being kicked', async ({ page }) => {
    const login = new LoginPage(page);

    // Login as student
    await login.login('student@cassava.com', 'student123');
    await page.waitForURL('/', { timeout: 10000 });

    // Clear class_id to simulate being kicked
    await page.evaluate(() => {
      const user = JSON.parse(localStorage.getItem('cv_user') || '{}');
      user.class_id = null;
      localStorage.setItem('cv_user', JSON.stringify(user));
    });

    // Reload to trigger join class flow
    await page.reload();
    await page.waitForURL('/login', { timeout: 10000 });

    // Should see join class form
    const hasJoinForm = await page.locator('text=Gabung Kelas').or(page.locator('text=Join a Class')).isVisible({ timeout: 10000 }).catch(() => false);

    expect(hasJoinForm).toBeTruthy();
  });

  test('Teacher: sidebar collapse persists', async ({ page }) => {
    const login = new LoginPage(page);

    await login.login(TEACHER.email, TEACHER.password);
    await page.waitForURL('/teacher', { timeout: 10000 });

    // Toggle sidebar (if visible)
    const collapseBtn = page.locator('[aria-label="Collapse sidebar"]').or(page.locator('[aria-label="Expand sidebar"]'));
    if (await collapseBtn.isVisible().catch(() => false)) {
      await collapseBtn.click();
      await page.waitForTimeout(500);

      // Check localStorage
      const collapsed = await page.evaluate(() => localStorage.getItem('cv_sidebar_collapsed'));
      expect(collapsed).toBeTruthy();
    }
  });
});
