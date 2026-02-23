// @ts-check
import { test, expect } from '@playwright/test';

test.describe('Admin Dashboard', () => {
    test('admin page load — hiện login form', async ({ page }) => {
        await page.goto('/admin.html');
        await expect(page).toHaveTitle(/Admin/i);
        // Should show login form since not authenticated
        await expect(page.locator('input[type="password"]')).toBeVisible();
    });

    test('admin login — sai password hiện thông báo', async ({ page }) => {
        await page.goto('/admin.html');
        const pwInput = page.locator('input[type="password"]');
        await pwInput.fill('wrongpassword');
        await pwInput.press('Enter');
        // Should show error or remain on login
        await page.waitForTimeout(2000);
        // Login form should still be visible (bad password)
        await expect(pwInput).toBeVisible();
    });
});
