import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';

test.describe('Error Handling', () => {
  test('Login with wrong password shows error', async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();
    await login.fillLogin('student@cassava.com', 'wrongpassword');
    await login.submitLogin();

    // Should show error message
    await expect(page.locator('.text-red-600, .text-red-700')).toBeVisible({ timeout: 5000 });
  });

  test('Login with non-existent email shows error', async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();
    await login.fillLogin('nonexistent@test.com', 'test123');
    await login.submitLogin();

    await expect(page.locator('.text-red-600, .text-red-700')).toBeVisible({ timeout: 5000 });
  });

  test('Signup with duplicate email shows error', async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();
    await login.signupStudent('Test', 'student@cassava.com', 'test123', 'DEMOAB');

    // Should show error about duplicate email
    await expect(page.locator('.text-red-600, .text-red-700')).toBeVisible({ timeout: 5000 });
  });

  test('Signup with invalid class code shows error', async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();
    await login.signupStudent('Test User', `test${Date.now()}@test.com`, 'test123', 'INVALID');

    // Should show error about invalid class code
    await expect(page.locator('.text-red-600, .text-red-700')).toBeVisible({ timeout: 5000 });
  });

  test('Login with empty fields shows error', async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();
    await login.submitLogin();

    // Should show error about required fields
    await expect(page.locator('.text-red-600, .text-red-700')).toBeVisible({ timeout: 5000 });
  });

  test('Teacher login redirects to /teacher', async ({ page }) => {
    const login = new LoginPage(page);
    await login.login('teacher@cassava.com', 'teacher123');
    await page.waitForURL('/teacher', { timeout: 10000 });
    expect(page.url()).toContain('/teacher');
  });

  test('Student login redirects to /', async ({ page }) => {
    const login = new LoginPage(page);
    await login.login('student@cassava.com', 'student123');
    await page.waitForURL('/', { timeout: 10000 });
    expect(page.url()).toContain('/');
  });

  test('Unauthenticated user redirected to /login', async ({ page }) => {
    await page.goto('/');
    await page.waitForURL('/login', { timeout: 10000 });
    expect(page.url()).toContain('/login');
  });

  test('Teacher accessing / redirects to /teacher', async ({ page }) => {
    const login = new LoginPage(page);
    await login.login('teacher@cassava.com', 'teacher123');
    await page.waitForURL('/teacher', { timeout: 10000 });

    // Try accessing student-only page
    await page.goto('/');
    await page.waitForURL('/teacher', { timeout: 10000 });
    expect(page.url()).toContain('/teacher');
  });
});
