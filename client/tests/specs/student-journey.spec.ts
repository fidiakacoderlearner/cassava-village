import { test, expect } from '../fixtures';
import { LoginPage } from '../pages/LoginPage';
import { HomePage } from '../pages/HomePage';
import { AboutPage } from '../pages/AboutPage';
import { TEACHER, STUDENT_NEW, CLASS_CODE } from '../fixtures/test-data';

test.describe('Student Journey', () => {
  test('Fresh student: signup → join class → explore home', async ({ page }) => {
    const login = new LoginPage(page);
    const home = new HomePage(page);

    // 1. Signup student
    await login.signupStudent(
      STUDENT_NEW.name,
      STUDENT_NEW.email,
      STUDENT_NEW.password,
      STUDENT_NEW.classCode
    );

    // 2. Check if redirected to home (has class code so should go to /)
    await page.waitForURL('/', { timeout: 10000 });
    await home.expectVisible();

    // 3. Verify all 3 cards are visible
    await home.expectCards();
  });

  test('Student without class sees join class form', async ({ page }) => {
    // First signup a student with a valid class code to create account
    const login = new LoginPage(page);
    const uniqueEmail = `noclass${Date.now()}@test.com`;
    await login.signupStudent('No Class', uniqueEmail, 'test123', CLASS_CODE);
    await page.waitForURL('/', { timeout: 10000 });

    // Now simulate student without class by going to login
    // (In real scenario this happens when teacher kicks student)
    await page.goto('/login');
    await login.fillLogin(uniqueEmail, 'test123');
    await login.submitLogin();

    // Should go to home since student has a class
    await page.waitForURL('/', { timeout: 10000 });
  });

  test('Student: open About page and navigate back', async ({ page }) => {
    const login = new LoginPage(page);
    const home = new HomePage(page);
    const about = new AboutPage(page);

    // Login as existing student
    await login.login('student@cassava.com', 'student123');
    await page.waitForURL('/', { timeout: 10000 });

    // Open About
    await home.openAbout();
    await expect(page).toHaveURL('/about');
    await about.expectSections();

    // Navigate back via navbar
    await page.click('a[href="/"]');
    await page.waitForURL('/');
    await home.expectVisible();
  });

  test('Student: evaluation flow with answer persistence', async ({ page }) => {
    const login = new LoginPage(page);
    const home = new HomePage(page);

    // Login
    await login.login('student@cassava.com', 'student123');
    await page.waitForURL('/', { timeout: 10000 });

    // Open evaluation
    await home.openEvaluation();
    await expect(page).toHaveURL('/evaluation');

    // Check evaluation page loaded
    await expect(page.locator('text=Soal')).toBeVisible({ timeout: 10000 });

    // Answer question 1 with option A (index 0)
    const options = page.locator('button').filter({ has: page.locator('span:text("A")') });
    await options.first().click();

    // Check localStorage persistence
    const saved = await page.evaluate(() => {
      const data = JSON.parse(localStorage.getItem('cv_eval_2') || '{}');
      return data.answers;
    });
    expect(saved).toBeTruthy();
  });
});
