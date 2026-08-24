import { test as base } from '@playwright/test';

export const test = base.extend({
  // Set Indonesian locale for all tests
  page: async ({ page }, use) => {
    await page.addInitScript(() => {
      localStorage.setItem('cv_lang', 'id');
    });
    await use(page);
  },
});

export { expect } from '@playwright/test';