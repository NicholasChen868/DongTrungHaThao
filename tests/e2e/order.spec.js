// @ts-check
import { test, expect } from '@playwright/test';

test.describe('Đặt hàng — Form flow', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        // Scroll to contact section
        await page.locator('#floatingOrderBtn').click();
        await page.waitForTimeout(1500);
    });

    test('form đặt hàng hiển thị đầy đủ fields', async ({ page }) => {
        await expect(page.locator('#orderName')).toBeVisible();
        await expect(page.locator('#orderPhone')).toBeVisible();
        await expect(page.locator('#orderAddress')).toBeVisible();
    });

    test('quantity selector tăng/giảm', async ({ page }) => {
        const qtyDisplay = page.locator('#qtyValue');
        await expect(qtyDisplay).toBeVisible();
        const initial = await qtyDisplay.textContent();
        await page.locator('#qtyPlus').click();
        await page.waitForTimeout(300);
        const after = await qtyDisplay.textContent();
        expect(Number(after)).toBeGreaterThan(Number(initial));
    });

    test('form validate — thiếu tên hiển thị lỗi', async ({ page }) => {
        await page.locator('#orderPhone').fill('0901234567');
        await page.locator('#orderAddress').fill('123 ABC');
        // Submit without name
        await page.locator('#orderForm button[type="submit"]').click();
        // HTML5 validation should prevent submission
        const nameInput = page.locator('#orderName');
        const validity = await nameInput.evaluate((el) => el.validity.valid);
        expect(validity).toBe(false);
    });

    test('giá tiền cập nhật khi thay đổi quantity', async ({ page }) => {
        const price = page.locator('#totalPrice');
        await expect(price).toBeVisible();
        const price1 = await price.textContent();
        await page.locator('#qtyPlus').click();
        await page.waitForTimeout(300);
        await page.locator('#qtyPlus').click();
        await page.waitForTimeout(300);
        const price2 = await price.textContent();
        expect(price2).not.toBe(price1);
    });
});
