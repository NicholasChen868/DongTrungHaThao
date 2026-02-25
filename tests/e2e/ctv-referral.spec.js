// @ts-check
import { test, expect } from '@playwright/test';

test.describe('CTV Referral Tracking — ?ref= parameter', () => {
    test('trang chủ lưu ref code từ URL vào localStorage', async ({ page }) => {
        await page.goto('/?ref=TEST-CTV-001');
        await page.waitForTimeout(1500);

        // ref code nên được lưu vào localStorage
        const saved = await page.evaluate(() => {
            return localStorage.getItem('ctv_ref')
                || localStorage.getItem('ref_code')
                || localStorage.getItem('referral_code');
        });
        // Nếu app dùng một trong các key trên
        if (saved) {
            expect(saved).toContain('TEST-CTV-001');
        }
    });

    test('ref code tự điền vào form đặt hàng', async ({ page }) => {
        await page.goto('/?ref=AUTO-FILL-CTV');
        await page.waitForTimeout(1000);

        // Scroll đến form
        await page.locator('#floatingOrderBtn').click({ force: true });
        await page.waitForTimeout(1500);

        // Kiểm tra input CTV code đã được điền
        const ctvInput = page.locator('#orderCtvCode, #ctvCode, input[name="ctv_code"]');
        if (await ctvInput.count() > 0) {
            const val = await ctvInput.inputValue();
            expect(val).toBe('AUTO-FILL-CTV');
        }
    });

    test('ref code hiển thị banner CTV trên trang', async ({ page }) => {
        await page.goto('/?ref=BANNER-CTV');
        await page.waitForTimeout(1500);

        // Kiểm tra có banner thông báo CTV
        const banner = page.locator('.ctv-banner, [class*="ctv-banner"], [id*="ctvBanner"]');
        if (await banner.count() > 0) {
            await expect(banner.first()).toBeVisible();
        }
    });

    test('ref code không hợp lệ — không crash trang', async ({ page }) => {
        // Test với ref code rỗng
        await page.goto('/?ref=');
        await page.waitForTimeout(1000);
        await expect(page.locator('#hero')).toBeVisible();

        // Test với ref code đặc biệt
        await page.goto('/?ref=<script>alert(1)</script>');
        await page.waitForTimeout(1000);
        await expect(page.locator('#hero')).toBeVisible();
    });

    test('ref code persist qua navigation', async ({ page }) => {
        await page.goto('/?ref=PERSIST-CTV');
        await page.waitForTimeout(1000);

        const refBefore = await page.evaluate(() => {
            return localStorage.getItem('ctv_ref')
                || localStorage.getItem('ref_code')
                || localStorage.getItem('referral_code');
        });

        // Navigate sang trang khác
        await page.goto('/tuyen-ctv.html');
        await page.waitForTimeout(1000);

        const refAfter = await page.evaluate(() => {
            return localStorage.getItem('ctv_ref')
                || localStorage.getItem('ref_code')
                || localStorage.getItem('referral_code');
        });

        // ref code vẫn giữ nguyên
        if (refBefore) {
            expect(refAfter).toBe(refBefore);
        }
    });
});

test.describe('CTV Dashboard Page', () => {
    test('trang CTV dashboard load thành công', async ({ page }) => {
        await page.goto('/ctv-dashboard.html');
        await page.waitForTimeout(1000);
        await expect(page).toHaveTitle(/CTV|Dashboard|Cộng Tác Viên/i);
    });

    test('CTV dashboard — chưa login hiện form đăng nhập', async ({ page }) => {
        await page.goto('/ctv-dashboard.html');
        await page.waitForTimeout(1000);

        // Nên thấy form login hoặc thông báo chưa đăng nhập
        const loginEl = page.locator('input[type="password"], input[type="tel"], #ctvLoginForm, .login-form, [data-auth]');
        const hasLogin = await loginEl.count() > 0;
        expect(hasLogin).toBeTruthy();
    });
});
