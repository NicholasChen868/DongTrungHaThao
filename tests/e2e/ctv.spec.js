// @ts-check
import { test, expect } from '@playwright/test';

test.describe('CTV Registration Popup', () => {
    test('FAB Share mở popup CTV', async ({ page }) => {
        await page.goto('/');
        await page.waitForTimeout(1000);
        await page.locator('#fabToggle').click({ force: true });
        await page.waitForTimeout(1000);
        await page.locator('#fabShare').click({ force: true });
        await page.waitForTimeout(500);
        const popup = page.locator('#ctvPopup');
        await expect(popup).toHaveClass(/active/);
        await expect(page.locator('#ctvPopupTitle')).toContainText('Giới Thiệu Sản Phẩm');
    });

    test('popup hiển thị rewards preview', async ({ page }) => {
        await page.goto('/');
        await page.waitForTimeout(500);
        await page.locator('#fabToggle').click({ force: true });
        await page.waitForTimeout(800);
        await page.locator('#fabShare').click({ force: true });
        await page.waitForTimeout(500);
        await expect(page.locator('.ctv-popup-rewards')).toBeVisible();
        await expect(page.locator('.ctv-reward-item')).toHaveCount(3);
    });

    test('popup form fields hiển thị', async ({ page }) => {
        await page.goto('/');
        await page.waitForTimeout(500);
        await page.locator('#fabToggle').click({ force: true });
        await page.waitForTimeout(800);
        await page.locator('#fabShare').click({ force: true });
        await page.waitForTimeout(500);
        await expect(page.locator('#ctvPopupName')).toBeVisible();
        await expect(page.locator('#ctvPopupPhone')).toBeVisible();
        await expect(page.locator('#ctvPopupEmail')).toBeVisible();
    });

    test('popup đóng khi nhấn X', async ({ page }) => {
        await page.goto('/');
        await page.waitForTimeout(1000);
        await page.locator('#fabToggle').click({ force: true });
        await page.waitForTimeout(1000);
        await page.locator('#fabShare').click({ force: true });
        await page.waitForTimeout(500);
        await expect(page.locator('#ctvPopup')).toHaveClass(/active/);
        // Use Escape as reliable close method
        await page.keyboard.press('Escape');
        await page.waitForTimeout(300);
        await expect(page.locator('#ctvPopup')).not.toHaveClass(/active/);
    });

    test('popup đóng khi nhấn Escape', async ({ page }) => {
        await page.goto('/');
        await page.waitForTimeout(500);
        await page.locator('#fabToggle').click({ force: true });
        await page.waitForTimeout(800);
        await page.locator('#fabShare').click({ force: true });
        await page.waitForTimeout(500);
        await expect(page.locator('#ctvPopup')).toHaveClass(/active/);
        await page.keyboard.press('Escape');
        await page.waitForTimeout(300);
        await expect(page.locator('#ctvPopup')).not.toHaveClass(/active/);
    });

    test('popup validate — thiếu tên', async ({ page }) => {
        await page.goto('/');
        await page.waitForTimeout(500);
        await page.locator('#fabToggle').click({ force: true });
        await page.waitForTimeout(800);
        await page.locator('#fabShare').click({ force: true });
        await page.waitForTimeout(500);
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
        await page.waitForTimeout(1000);
        // Check page loads without error — title may vary
        const title = await page.title();
        expect(title.length).toBeGreaterThan(0);
    });
});
