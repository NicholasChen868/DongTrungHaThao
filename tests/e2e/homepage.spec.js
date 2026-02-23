// @ts-check
import { test, expect } from '@playwright/test';

test.describe('Trang chủ — Load & Navigate', () => {
    test('trang chủ load thành công', async ({ page }) => {
        await page.goto('/');
        await expect(page).toHaveTitle(/Maldala|Đông Trùng/i);
        await expect(page.locator('#hero')).toBeVisible();
    });

    test('navbar hiển thị đúng menu items', async ({ page }) => {
        await page.goto('/');
        const nav = page.locator('#navLinks');
        await expect(nav.getByText('Giới Thiệu')).toBeVisible();
        await expect(nav.getByText('Sản Phẩm')).toBeVisible();
        await expect(nav.getByText('Đặt Hàng')).toBeVisible();
    });

    test('bottom bar hiển thị 2 CTA', async ({ page }) => {
        await page.goto('/');
        const bar = page.locator('#bottomBar');
        await expect(bar).toBeVisible();
        await expect(bar.getByText('Gọi Ngay')).toBeVisible();
        await expect(bar.getByText('Đặt Hàng')).toBeVisible();
    });

    test('scroll to contact khi nhấn Đặt Hàng', async ({ page }) => {
        await page.goto('/');
        await page.locator('#floatingOrderBtn').click();
        // Wait for smooth scroll to complete
        await page.waitForTimeout(1500);
        const contact = page.locator('#contact');
        await expect(contact).toBeInViewport({ ratio: 0.1 });
    });

    test('FAB toggle mở menu dọc', async ({ page }) => {
        await page.goto('/');
        // Wait for page JS to fully init
        await page.waitForTimeout(1000);
        const fab = page.locator('#fabContainer');
        const toggle = page.locator('#fabToggle');
        await expect(toggle).toBeVisible();
        await toggle.click({ force: true });
        await page.waitForTimeout(800);
        await expect(fab).toHaveClass(/open/);
    });

    test('FAB đóng khi nhấn ngoài', async ({ page }) => {
        await page.goto('/');
        await page.waitForTimeout(500);
        await page.locator('#fabToggle').click();
        await page.waitForTimeout(500);
        await expect(page.locator('#fabContainer')).toHaveClass(/open/);
        await page.locator('body').click({ position: { x: 10, y: 10 } });
        await page.waitForTimeout(300);
        await expect(page.locator('#fabContainer')).not.toHaveClass(/open/);
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
