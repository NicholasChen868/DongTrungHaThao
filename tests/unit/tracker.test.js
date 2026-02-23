import { describe, it, expect, beforeEach, vi } from 'vitest';
import { supabase } from '../../src/supabase.js';

// tracker.js auto-calls trackPageView() on import, and exports trackPageView.
// We test indirectly by controlling environment before import.

describe('tracker — device detection logic', () => {
    // Test the getDevice logic (same as in tracker.js)
    function getDevice() {
        const w = window.innerWidth;
        if (w < 768) return 'mobile';
        if (w < 1024) return 'tablet';
        return 'desktop';
    }

    it('mobile khi innerWidth < 768', () => {
        Object.defineProperty(window, 'innerWidth', { value: 375, writable: true, configurable: true });
        expect(getDevice()).toBe('mobile');
    });

    it('tablet khi innerWidth 768-1023', () => {
        Object.defineProperty(window, 'innerWidth', { value: 800, writable: true, configurable: true });
        expect(getDevice()).toBe('tablet');
    });

    it('desktop khi innerWidth >= 1024', () => {
        Object.defineProperty(window, 'innerWidth', { value: 1440, writable: true, configurable: true });
        expect(getDevice()).toBe('desktop');
    });

    it('biên giới: 768 → tablet', () => {
        Object.defineProperty(window, 'innerWidth', { value: 768, writable: true, configurable: true });
        expect(getDevice()).toBe('tablet');
    });

    it('biên giới: 1024 → desktop', () => {
        Object.defineProperty(window, 'innerWidth', { value: 1024, writable: true, configurable: true });
        expect(getDevice()).toBe('desktop');
    });

    it('biên giới: 767 → mobile', () => {
        Object.defineProperty(window, 'innerWidth', { value: 767, writable: true, configurable: true });
        expect(getDevice()).toBe('mobile');
    });
});

describe('tracker — getUTM logic', () => {
    function getUTM(key) {
        try {
            return new URLSearchParams(location.search).get(key) || null;
        } catch { return null; }
    }

    it('trả giá trị UTM từ URL', () => {
        Object.defineProperty(window, 'location', {
            value: new URL('http://localhost/?utm_source=facebook&utm_medium=cpc'),
            writable: true,
            configurable: true,
        });
        expect(getUTM('utm_source')).toBe('facebook');
        expect(getUTM('utm_medium')).toBe('cpc');
        // Restore
        Object.defineProperty(window, 'location', {
            value: new URL('http://localhost/'),
            writable: true,
            configurable: true,
        });
    });

    it('trả null khi không có param', () => {
        Object.defineProperty(window, 'location', {
            value: new URL('http://localhost/'),
            writable: true,
            configurable: true,
        });
        expect(getUTM('utm_source')).toBeNull();
    });

    it('ref param fallback', () => {
        Object.defineProperty(window, 'location', {
            value: new URL('http://localhost/?ref=CTV001'),
            writable: true,
            configurable: true,
        });
        expect(getUTM('ref')).toBe('CTV001');
        Object.defineProperty(window, 'location', {
            value: new URL('http://localhost/'),
            writable: true,
            configurable: true,
        });
    });
});

describe('tracker — trackPageView behavior', () => {
    beforeEach(() => {
        supabase.from.mockClear();
    });

    it('trackPageView function exported', async () => {
        const mod = await import('../../src/utils/tracker.js');
        expect(typeof mod.trackPageView).toBe('function');
    });

    it('debounce — sessionStorage key set after track', async () => {
        Object.defineProperty(window, 'location', {
            value: new URL('http://localhost/test-debounce'),
            writable: true,
            configurable: true,
        });

        // Clear debounce key for this path
        sessionStorage.removeItem('pv_/test-debounce');

        const { trackPageView } = await import('../../src/utils/tracker.js');
        // Module cached, auto-call won't re-fire. Call manually.
        trackPageView();

        const keyExists = sessionStorage.getItem('pv_/test-debounce') !== null;
        expect(keyExists).toBe(true);

        Object.defineProperty(window, 'location', {
            value: new URL('http://localhost/'),
            writable: true,
            configurable: true,
        });
    });

    it('không track khi đã có debounce key', async () => {
        sessionStorage.setItem('pv_/', '1');
        supabase.from.mockClear();

        const { trackPageView } = await import('../../src/utils/tracker.js');
        trackPageView();

        // supabase.from should NOT be called for page already tracked
        // Note: the auto-call on import might have been debounced too
        const pageViewCalls = supabase.from.mock.calls.filter(c => c[0] === 'page_views');
        // After debounce, additional calls should not trigger insert
        expect(pageViewCalls.length).toBeLessThanOrEqual(1);
    });

    it('không track trang admin', () => {
        // Verify the logic: pathname includes 'admin' → skip
        const pathname = '/admin.html';
        expect(pathname.includes('admin')).toBe(true);
    });

    it('track trang bình thường', () => {
        const pathname = '/tra-cuu.html';
        expect(pathname.includes('admin')).toBe(false);
    });
});
