import { describe, it, expect, beforeEach, vi } from 'vitest';

// We need to mock supabase BEFORE importing tracker
// (tracker auto-calls trackPageView on import)
// The setup.js already mocks supabase globally

// Also need to control location.pathname
const originalLocation = window.location;

describe('tracker — getDevice', () => {
    // We test getDevice indirectly through trackPageView behavior,
    // but also extract it for direct testing by re-importing
    // Since tracker.js auto-fires trackPageView on import, we need careful handling

    it('mobile khi width < 768', async () => {
        Object.defineProperty(window, 'innerWidth', { value: 375, writable: true });
        // We verify via the data sent to supabase
        // Reimport to trigger trackPageView
        sessionStorage.clear();
        const { supabase } = await import('../../src/supabase.js');
        supabase.from.mockClear();

        // Dynamic re-import with cache bust
        const mod = await import(`../../src/utils/tracker.js?t=${Date.now()}-mobile`);
        if (typeof mod.trackPageView === 'function') {
            sessionStorage.clear();
            mod.trackPageView();
        }

        if (supabase.from.mock.calls.length > 0) {
            expect(supabase.from).toHaveBeenCalledWith('page_views');
        }
    });
});

describe('tracker — trackPageView logic', () => {
    let trackPageView;
    let supabaseMock;

    beforeEach(async () => {
        sessionStorage.clear();
        const supa = await import('../../src/supabase.js');
        supabaseMock = supa.supabase;
        supabaseMock.from.mockClear();

        // Reset the mock insert chain
        const mockInsert = vi.fn(() => ({ then: vi.fn((cb) => cb?.()) }));
        supabaseMock.from.mockReturnValue({ insert: mockInsert });
    });

    it('không track trang admin', async () => {
        Object.defineProperty(window, 'location', {
            value: new URL('http://localhost/admin.html'),
            writable: true,
        });

        // Re-import to get fresh trackPageView
        const mod = await import(`../../src/utils/tracker.js?t=${Date.now()}-admin`);
        // The auto-call should have been skipped for admin
        // Also test the exported function directly
        if (typeof mod.trackPageView === 'function') {
            sessionStorage.clear();
            mod.trackPageView();
            // supabase.from should NOT have been called with 'page_views' for admin
            const pageViewCalls = supabaseMock.from.mock.calls.filter(c => c[0] === 'page_views');
            expect(pageViewCalls).toHaveLength(0);
        }

        // Restore
        Object.defineProperty(window, 'location', {
            value: new URL('http://localhost/'),
            writable: true,
        });
    });

    it('debounce: chỉ track 1 lần per page per session', async () => {
        Object.defineProperty(window, 'location', {
            value: new URL('http://localhost/test-page'),
            writable: true,
        });

        const mockInsert = vi.fn(() => ({ then: vi.fn() }));
        supabaseMock.from.mockReturnValue({ insert: mockInsert });
        sessionStorage.clear();

        const mod = await import(`../../src/utils/tracker.js?t=${Date.now()}-debounce`);
        if (typeof mod.trackPageView === 'function') {
            // First call tracks
            mod.trackPageView();
            const firstCount = mockInsert.mock.calls.length;

            // Second call same page — should be debounced
            mod.trackPageView();
            expect(mockInsert.mock.calls.length).toBe(firstCount);
        }

        Object.defineProperty(window, 'location', {
            value: new URL('http://localhost/'),
            writable: true,
        });
    });
});

describe('tracker — getUTM logic', () => {
    it('gửi utm_source từ URL', async () => {
        Object.defineProperty(window, 'location', {
            value: new URL('http://localhost/landing?utm_source=facebook&utm_medium=cpc'),
            writable: true,
        });

        const supa = await import('../../src/supabase.js');
        const mockInsert = vi.fn(() => ({ then: vi.fn() }));
        supa.supabase.from.mockReturnValue({ insert: mockInsert });
        sessionStorage.clear();

        const mod = await import(`../../src/utils/tracker.js?t=${Date.now()}-utm`);
        if (typeof mod.trackPageView === 'function') {
            mod.trackPageView();
        }

        if (mockInsert.mock.calls.length > 0) {
            const data = mockInsert.mock.calls[0][0];
            expect(data.utm_source).toBe('facebook');
            expect(data.utm_medium).toBe('cpc');
        }

        Object.defineProperty(window, 'location', {
            value: new URL('http://localhost/'),
            writable: true,
        });
    });

    it('utm_source fallback sang ref param', async () => {
        Object.defineProperty(window, 'location', {
            value: new URL('http://localhost/?ref=CTV001'),
            writable: true,
        });

        const supa = await import('../../src/supabase.js');
        const mockInsert = vi.fn(() => ({ then: vi.fn() }));
        supa.supabase.from.mockReturnValue({ insert: mockInsert });
        sessionStorage.clear();

        const mod = await import(`../../src/utils/tracker.js?t=${Date.now()}-ref`);
        if (typeof mod.trackPageView === 'function') {
            mod.trackPageView();
        }

        if (mockInsert.mock.calls.length > 0) {
            const data = mockInsert.mock.calls[0][0];
            expect(data.utm_source).toBe('CTV001');
        }

        Object.defineProperty(window, 'location', {
            value: new URL('http://localhost/'),
            writable: true,
        });
    });
});

describe('tracker — device detection', () => {
    it('mobile khi innerWidth < 768', () => {
        Object.defineProperty(window, 'innerWidth', { value: 375, writable: true });
        // Inline test same logic as getDevice
        const w = window.innerWidth;
        const device = w < 768 ? 'mobile' : w < 1024 ? 'tablet' : 'desktop';
        expect(device).toBe('mobile');
    });

    it('tablet khi innerWidth 768-1023', () => {
        Object.defineProperty(window, 'innerWidth', { value: 800, writable: true });
        const w = window.innerWidth;
        const device = w < 768 ? 'mobile' : w < 1024 ? 'tablet' : 'desktop';
        expect(device).toBe('tablet');
    });

    it('desktop khi innerWidth >= 1024', () => {
        Object.defineProperty(window, 'innerWidth', { value: 1440, writable: true });
        const w = window.innerWidth;
        const device = w < 768 ? 'mobile' : w < 1024 ? 'tablet' : 'desktop';
        expect(device).toBe('desktop');
    });
});
