// @ts-check
import { test, expect } from '@playwright/test';

test.describe('CTV Registration Popup', () => {
    test('FAB Share mở popup CTV', async ({ page }) => {
        await page.goto('/');
        await page.locator('#fabToggle').click();
        await page.locator('#fabShare').click();
        const popup = page.locator('#ctvPopup');
        await expect(popup).toHaveClass(/active/);
        await expect(page.locator('#ctvPopupTitle')).toContainText('Kiếm Tiền');
    });

    test('popup hiển thị rewards preview', async ({ page }) => {
        await page.goto('/');
        await page.locator('#fabToggle').click();
        await page.locator('#fabShare').click();
        await expect(page.locator('.ctv-popup-rewards')).toBeVisible();
        await expect(page.locator('.ctv-reward-item')).toHaveCount(3);
    });

    test('popup form fields hiển thị', async ({ page }) => {
        await page.goto('/');
        await page.locator('#fabToggle').click();
        await page.locator('#fabShare').click();
        await expect(page.locator('#ctvPopupName')).toBeVisible();
        await expect(page.locator('#ctvPopupPhone')).toBeVisible();
        await expect(page.locator('#ctvPopupEmail')).toBeVisible();
    });

    test('popup đóng khi nhấn X', async ({ page }) => {
        await page.goto('/');
        await page.locator('#fabToggle').click();
        await page.locator('#fabShare').click();
        await expect(page.locator('#ctvPopup')).toHaveClass(/active/);
        await page.locator('#ctvPopupClose').click();
        await expect(page.locator('#ctvPopup')).not.toHaveClass(/active/);
    });

    test('popup đóng khi nhấn Escape', async ({ page }) => {
        await page.goto('/');
        await page.locator('#fabToggle').click();
        await page.locator('#fabShare').click();
        await expect(page.locator('#ctvPopup')).toHaveClass(/active/);
        await page.keyboard.press('Escape');
        await expect(page.locator('#ctvPopup')).not.toHaveClass(/active/);
    });

    test('popup validate — thiếu tên', async ({ page }) => {
        await page.goto('/');
        await page.locator('#fabToggle').click();
        await page.locator('#fabShare').click();
        await page.locator('#ctvPopupPhone').fill('0901234567');
        await page.locator('.ctv-popup-submit').click();
        // HTML5 validation prevents submit
        const validity = await page.locator('#ctvPopupName').evaluate((el) => el.validity.valid);
        expect(validity).toBe(false);
    });
});

test.describe('CTV Dashboard — Trang tuyển CTV', () => {
    test('trang tuyển CTV load', async ({ page }) => {
        await page.goto('/tuyen-ctv.html');
        await expect(page).toHaveTitle(/CTV|Cộng Tác Viên/i);
    });
});
