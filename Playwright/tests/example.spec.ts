import { test, expect } from '@playwright/test';

test('basic test example', async ({ page }) => {
  // Navigate to a page
  await page.goto('https://example.com');

  // Check that the page title is correct
  await expect(page).toHaveTitle(/Example Domain/);

  // Check that the page contains expected text
  await expect(page.locator('h1')).toContainText('Example Domain');
});

test('job tracker app test', async ({ page }) => {
  // This test assumes the job tracker app is running on localhost:3000
  // You may need to adjust the URL and test logic based on your app

  await page.goto('http://localhost:3000');

  // Add your test logic here
  // For example:
  // await expect(page.locator('.app-title')).toBeVisible();
  // await page.click('button.add-job');
  // etc.
});