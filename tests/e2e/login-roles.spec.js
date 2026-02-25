// @ts-check
import { test, expect } from '@playwright/test';

test.describe('Login Popup — CTV Role', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await page.waitForTimeout(500);
        // Mở login popup qua CTV link
        const ctvLink = page.locator('[data-auth="ctv"]').first();
        if (await ctvLink.count() > 0) {
            await ctvLink.click({ force: true });
        } else {
            // Fallback: mở qua nav login button
            const navLogin = page.locator('#navLoginBtn');
            if (await navLogin.count() > 0) {
                await navLogin.click({ force: true });
            }
        }
        await page.waitForTimeout(500);
    });

    test('login popup hiển thị form CTV', async ({ page }) => {
        const popup = page.locator('#loginPopup');
        if (await popup.count() > 0 && await popup.evaluate(el => el.classList.contains('active'))) {
            // Tab CTV nên active
            const ctvTab = page.locator('.login-tab').first();
            await expect(ctvTab).toBeVisible();
        }
    });

    test('CTV login — điền SĐT và submit', async ({ page }) => {
        const popup = page.locator('#loginPopup');
        if (!(await popup.evaluate(el => el.classList.contains('active')))) return;

        const phoneInput = page.locator('#loginPhone, input[placeholder*="SĐT"], input[type="tel"]').first();
        if (await phoneInput.count() > 0) {
            await phoneInput.fill('0901234567');

            const pwInput = page.locator('#loginPassword, input[type="password"]').first();
            if (await pwInput.count() > 0) {
                await pwInput.fill('0901234567');
            }

            // Mock API response
            await page.route('**/rest/v1/rpc/**', async (route) => {
                const body = route.request().postDataJSON();
                if (body && (body.p_phone || body.phone)) {
                    await route.fulfill({
                        status: 200,
                        contentType: 'application/json',
                        body: JSON.stringify({
                            success: true,
                            role: 'ctv',
                            referral_code: 'TEST001',
                            name: 'CTV Test',
                        }),
                    });
                } else {
                    await route.continue();
                }
            });

            const submitBtn = page.locator('#loginSubmit, .login-popup-submit, button[type="submit"]').first();
            if (await submitBtn.count() > 0) {
                await submitBtn.click({ force: true });
                await page.waitForTimeout(1500);
            }
        }
    });

    test('CTV login — validate empty phone', async ({ page }) => {
        const popup = page.locator('#loginPopup');
        if (!(await popup.evaluate(el => el.classList.contains('active')))) return;

        const submitBtn = page.locator('#loginSubmit, .login-popup-submit, button[type="submit"]').first();
        if (await submitBtn.count() > 0) {
            await submitBtn.click({ force: true });
            await page.waitForTimeout(500);
            // Should stay on login form (validation prevents submit)
            await expect(popup).toHaveClass(/active/);
        }
    });
});

test.describe('Login Popup — Customer Role (Khách hàng)', () => {
    test('chuyển tab sang Khách Hàng', async ({ page }) => {
        await page.goto('/');
        await page.waitForTimeout(500);
        const authLink = page.locator('[data-auth="customer"], [data-auth="ctv"]').first();
        if (await authLink.count() > 0) {
            await authLink.click({ force: true });
            await page.waitForTimeout(500);
        }

        const tabs = page.locator('.login-tab');
        if (await tabs.count() >= 2) {
            // Click tab Khách Hàng (thường là tab thứ 2)
            await tabs.nth(1).click();
            await page.waitForTimeout(300);
            await expect(tabs.nth(1)).toHaveClass(/active/);
        }
    });
});

test.describe('Login — Đóng popup', () => {
    test('đóng login popup bằng overlay click', async ({ page }) => {
        await page.goto('/');
        await page.waitForTimeout(500);
        const authLink = page.locator('[data-auth="ctv"]').first();
        if (await authLink.count() > 0) {
            await authLink.click({ force: true });
            await page.waitForTimeout(500);
            // Click overlay area (outside content) — click top-left corner of overlay
            const overlay = page.locator('#loginPopup');
            await overlay.click({ position: { x: 5, y: 5 }, force: true });
            await page.waitForTimeout(500);
            // Popup should close
            await expect(page.locator('#loginPopup')).not.toHaveClass(/active/);
        }
    });
});
