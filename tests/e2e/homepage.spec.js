// @ts-check
import { test, expect } from '@playwright/test';

test.describe('Trang chủ — Load & Navigate', () => {
    test('trang chủ load thành công', async ({ page }) => {
        await page.goto('/');
        await expect(page).toHaveTitle(/Maldalla|Đông Trùng/i);
        await expect(page.locator('#hero')).toBeVisible();
    });

    test('navbar hiển thị đúng menu items', async ({ page }) => {
        await page.goto('/');
        const nav = page.locator('#navLinks');
        await expect(nav.getByText('Sản Phẩm')).toBeVisible();
        await expect(nav.getByText('Quy Trình')).toBeVisible();
        await expect(nav.getByText('Đặt Hàng')).toBeVisible();
    });

    test('FAB widget hiển thị với tooltip', async ({ page }) => {
        await page.goto('/');
        await page.waitForTimeout(500);
        const fab = page.locator('#fabWidget');
        const toggle = page.locator('#fabToggle');
        const tooltip = page.locator('#fabTooltip');
        await expect(fab).toBeVisible();
        await expect(toggle).toBeVisible();
        await expect(tooltip).toBeVisible();
    });

    test('FAB toggle mở orbit circular buttons', async ({ page }) => {
        await page.goto('/');
        await page.waitForTimeout(1000);
        const widget = page.locator('#fabWidget');
        const toggle = page.locator('#fabToggle');
        await toggle.click({ force: true });
        await page.waitForTimeout(800);
        await expect(widget).toHaveClass(/open/);
    });

    test('FAB đóng khi nhấn ngoài', async ({ page }) => {
        await page.goto('/');
        await page.waitForTimeout(500);
        await page.locator('#fabToggle').click({ force: true });
        await page.waitForTimeout(500);
        await expect(page.locator('#fabWidget')).toHaveClass(/open/);
        await page.locator('body').click({ position: { x: 10, y: 10 } });
        await page.waitForTimeout(300);
        await expect(page.locator('#fabWidget')).not.toHaveClass(/open/);
    });

    test('scroll to contact khi nhấn Order', async ({ page }) => {
        await page.goto('/');
        await page.waitForTimeout(500);
        // Open FAB widget first, then click order button
        await page.locator('#fabToggle').click({ force: true });
        await page.waitForTimeout(800);
        await page.locator('#floatingOrderBtn').click({ force: true });
        await page.waitForTimeout(1500);
        const contact = page.locator('#contact');
        await expect(contact).toBeInViewport({ ratio: 0.1 });
    });

    test('smooth scroll giữa sections', async ({ page }) => {
        await page.goto('/');
        await page.locator('a[href="#about"]').first().click();
        await page.waitForTimeout(1000);
        const about = page.locator('#about');
        await expect(about).toBeInViewport({ ratio: 0.1 });
    });
});

test.describe('Trang chủ — Mobile responsive', () => {
    test.use({ viewport: { width: 390, height: 844 } });

    test('hamburger menu hiển thị trên mobile', async ({ page }) => {
        await page.goto('/');
        const toggle = page.locator('#navToggle');
        await expect(toggle).toBeVisible();
    });

    test('mobile menu mở/đóng', async ({ page }) => {
        await page.goto('/');
        const toggle = page.locator('#navToggle');
        const links = page.locator('#navLinks');
        await toggle.click();
        await expect(links).toHaveClass(/active/);
        await toggle.click();
        await expect(links).not.toHaveClass(/active/);
    });
});

test.describe('Promotion Popup', () => {
    test('mở popup từ FAB promo button', async ({ page }) => {
        await page.goto('/');
        await page.waitForTimeout(500);
        await page.locator('#fabToggle').click({ force: true });
        await page.waitForTimeout(800);
        await page.locator('#fabPromo').click();
        await page.waitForTimeout(300);
        const popup = page.locator('#promoPopup');
        await expect(popup).toHaveClass(/active/);
        await expect(page.locator('#promoPopupTitle')).toContainText('Bứt Phá');
    });

    test('promo popup có content Đinh Ngọ', async ({ page }) => {
        await page.goto('/');
        await page.waitForTimeout(500);
        await page.locator('#fabToggle').click({ force: true });
        await page.waitForTimeout(800);
        await page.locator('#fabPromo').click();
        await page.waitForTimeout(300);
        await expect(page.locator('.promo-popup-card')).toContainText('qua Tết đi');
        await expect(page.locator('.promo-badge')).toContainText('GIẢM 5%');
    });

    test('đóng promo popup bằng nút X', async ({ page }) => {
        await page.goto('/');
        await page.waitForTimeout(500);
        await page.locator('#fabToggle').click({ force: true });
        await page.waitForTimeout(800);
        await page.locator('#fabPromo').click({ force: true });
        await page.waitForTimeout(500);
        // Close via Escape (most reliable)
        await page.keyboard.press('Escape');
        await page.waitForTimeout(300);
        await expect(page.locator('#promoPopup')).not.toHaveClass(/active/);
    });

    test('đóng promo popup bằng Escape', async ({ page }) => {
        await page.goto('/');
        await page.waitForTimeout(500);
        await page.locator('#fabToggle').click({ force: true });
        await page.waitForTimeout(800);
        await page.locator('#fabPromo').click();
        await page.waitForTimeout(300);
        await page.keyboard.press('Escape');
        await page.waitForTimeout(300);
        await expect(page.locator('#promoPopup')).not.toHaveClass(/active/);
    });
});

test.describe('Login Popup', () => {
    test('mở login popup khi click CTV dashboard link', async ({ page }) => {
        await page.goto('/');
        await page.waitForTimeout(500);
        const link = page.locator('[data-auth="ctv"]').first();
        await link.click();
        await page.waitForTimeout(300);
        const popup = page.locator('#loginPopup');
        await expect(popup).toHaveClass(/active/);
    });

    test('login popup có tab CTV và Khách Hàng', async ({ page }) => {
        await page.goto('/');
        await page.waitForTimeout(500);
        const link = page.locator('[data-auth="ctv"]').first();
        await link.click();
        await page.waitForTimeout(300);
        const tabs = page.locator('.login-tab');
        await expect(tabs).toHaveCount(2);
        await expect(tabs.first()).toContainText('CTV');
    });

    test('login popup đóng bằng Escape', async ({ page }) => {
        await page.goto('/');
        await page.waitForTimeout(500);
        const link = page.locator('[data-auth="ctv"]').first();
        await link.click();
        await page.waitForTimeout(300);
        await page.keyboard.press('Escape');
        await page.waitForTimeout(300);
        await expect(page.locator('#loginPopup')).not.toHaveClass(/active/);
    });
});
