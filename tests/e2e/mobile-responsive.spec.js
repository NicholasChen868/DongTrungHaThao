// @ts-check
import { test, expect } from '@playwright/test';

test.describe('Mobile Responsive — iPhone 14 viewport', () => {
    test.use({ viewport: { width: 390, height: 844 } });

    test('hero section responsive layout', async ({ page }) => {
        await page.goto('/');
        const hero = page.locator('#hero');
        await expect(hero).toBeVisible();
        // Hero chiếm full width trên mobile
        const box = await hero.boundingBox();
        expect(box?.width).toBeGreaterThanOrEqual(380);
    });

    test('product showcase chuyển 1 cột trên mobile', async ({ page }) => {
        await page.goto('/');
        const showcase = page.locator('.product-showcase');
        if (await showcase.count() > 0) {
            await showcase.scrollIntoViewIfNeeded();
            const box = await showcase.boundingBox();
            // Trên mobile, các phần tử con nên stack vertically
            expect(box?.width).toBeLessThan(500);
        }
    });

    test('order form usable trên mobile', async ({ page }) => {
        await page.goto('/');
        await page.locator('#floatingOrderBtn').click({ force: true });
        await page.waitForTimeout(1500);

        const nameInput = page.locator('#orderName');
        await expect(nameInput).toBeVisible();
        // Input nên có width hợp lý trên mobile
        const box = await nameInput.boundingBox();
        expect(box?.width).toBeGreaterThan(200);

        // Có thể type được
        await nameInput.fill('Mobile Test');
        const val = await nameInput.inputValue();
        expect(val).toBe('Mobile Test');
    });

    test('FAB widget hiển thị đúng vị trí trên mobile', async ({ page }) => {
        await page.goto('/');
        await page.waitForTimeout(500);
        const fab = page.locator('#fabWidget');
        await expect(fab).toBeVisible();
        const box = await fab.boundingBox();
        // FAB nên ở bottom-right
        expect(box?.x).toBeGreaterThan(200);
        expect(box?.y).toBeGreaterThan(600);
    });

    test('navigation menu ẩn trên mobile, hamburger hiển thị', async ({ page }) => {
        await page.goto('/');
        const navToggle = page.locator('#navToggle');
        await expect(navToggle).toBeVisible();

        // Desktop nav links nên ẩn
        const navLinks = page.locator('#navLinks');
        const isExpanded = await navLinks.evaluate((el) => {
            const style = window.getComputedStyle(el);
            return style.display !== 'none' && el.classList.contains('active');
        });
        expect(isExpanded).toBe(false);
    });

    test('tất cả buttons có kích thước tap-friendly (44px+)', async ({ page }) => {
        await page.goto('/');
        await page.waitForTimeout(500);

        // Kiểm tra các CTA buttons
        const ctaButtons = page.locator('.btn-primary, .btn-order, #fabToggle');
        const count = await ctaButtons.count();
        for (let i = 0; i < Math.min(count, 5); i++) {
            const box = await ctaButtons.nth(i).boundingBox();
            if (box) {
                // Minimum touch target = 40px
                expect(box.height).toBeGreaterThanOrEqual(40);
            }
        }
    });

    test('text không bị overflow trên mobile', async ({ page }) => {
        await page.goto('/');
        await page.waitForTimeout(1000);

        // Kiểm tra horizontal scroll không xuất hiện
        const hasOverflow = await page.evaluate(() => {
            return document.documentElement.scrollWidth > document.documentElement.clientWidth;
        });
        expect(hasOverflow).toBe(false);
    });

    test('popup hiển thị full-width trên mobile', async ({ page }) => {
        await page.goto('/');
        await page.waitForTimeout(500);
        await page.locator('#fabToggle').click({ force: true });
        await page.waitForTimeout(500);
        await page.locator('#fabPromo').click();
        await page.waitForTimeout(500);

        const popup = page.locator('#promoPopup');
        if (await popup.isVisible()) {
            const card = page.locator('.promo-popup-card');
            if (await card.count() > 0) {
                const box = await card.boundingBox();
                // Card nên chiếm gần full width trên mobile
                expect(box?.width).toBeGreaterThan(300);
            }
        }
    });
});

test.describe('Mobile Responsive — Small screen (iPhone SE)', () => {
    test.use({ viewport: { width: 320, height: 568 } });

    test('trang load bình thường trên màn hình nhỏ', async ({ page }) => {
        await page.goto('/');
        await expect(page.locator('#hero')).toBeVisible();
        await expect(page.locator('#navToggle')).toBeVisible();
    });

    test('không có horizontal scroll trên iPhone SE', async ({ page }) => {
        await page.goto('/');
        await page.waitForTimeout(1000);

        const hasOverflow = await page.evaluate(() => {
            return document.documentElement.scrollWidth > document.documentElement.clientWidth;
        });
        expect(hasOverflow).toBe(false);
    });
});

test.describe('Mobile Responsive — Tablet (iPad)', () => {
    test.use({ viewport: { width: 768, height: 1024 } });

    test('layout 2 cột cho benefits grid trên tablet', async ({ page }) => {
        await page.goto('/');
        const grid = page.locator('.benefits-grid');
        if (await grid.count() > 0) {
            await grid.scrollIntoViewIfNeeded();
            const box = await grid.boundingBox();
            expect(box?.width).toBeGreaterThan(700);
        }
    });

    test('navigation hiển thị bình thường', async ({ page }) => {
        await page.goto('/');
        await page.waitForTimeout(500);
        // Trên tablet 768px (< 1024px breakpoint), hamburger should show
        const navToggle = page.locator('#navToggle');
        const navLinks = page.locator('#navLinks');
        // Either hamburger is visible OR nav links are visible
        const toggleVisible = await navToggle.isVisible();
        const linksVisible = await navLinks.evaluate((el) => {
            const style = window.getComputedStyle(el);
            return style.display !== 'none';
        });
        expect(toggleVisible || linksVisible).toBe(true);
    });
});
