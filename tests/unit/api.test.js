import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
    apiCall,
    handleApiError,
    getVietnameseErrorMessage,
    fireAndForget,
    initNetworkStatus,
    isRetryableError,
    getBackoffMs,
} from '../../src/utils/api.js';

// ===================================
// isRetryableError
// ===================================
describe('isRetryableError — phân loại lỗi', () => {
    it('retry khi fetch failed', () => {
        expect(isRetryableError(new Error('Failed to fetch'))).toBe(true);
    });

    it('retry khi network error', () => {
        expect(isRetryableError(new Error('NetworkError when attempting'))).toBe(true);
    });

    it('retry khi timeout', () => {
        expect(isRetryableError(new Error('Request timeout'))).toBe(true);
    });

    it('retry khi ECONNREFUSED', () => {
        expect(isRetryableError(new Error('ECONNREFUSED'))).toBe(true);
    });

    it('retry khi server 5xx (code)', () => {
        expect(isRetryableError({ code: '500', message: 'Internal Server Error' })).toBe(true);
    });

    it('retry khi code 503', () => {
        expect(isRetryableError({ code: '503', message: 'Service Unavailable' })).toBe(true);
    });

    it('retry khi service unavailable message', () => {
        expect(isRetryableError(new Error('Service unavailable'))).toBe(true);
    });

    it('retry khi overloaded', () => {
        expect(isRetryableError(new Error('Database overloaded'))).toBe(true);
    });

    it('KHÔNG retry khi auth error', () => {
        expect(isRetryableError(new Error('Invalid API key'))).toBe(false);
    });

    it('KHÔNG retry khi validation error', () => {
        expect(isRetryableError(new Error('Invalid input: phone format'))).toBe(false);
    });

    it('KHÔNG retry khi null', () => {
        expect(isRetryableError(null)).toBe(false);
    });

    it('KHÔNG retry khi undefined', () => {
        expect(isRetryableError(undefined)).toBe(false);
    });

    it('KHÔNG retry khi error không có message', () => {
        expect(isRetryableError({})).toBe(false);
    });
});

// ===================================
// getBackoffMs
// ===================================
describe('getBackoffMs — exponential backoff timing', () => {
    it('attempt 0 → 1000ms', () => {
        expect(getBackoffMs(0)).toBe(1000);
    });

    it('attempt 1 → 2000ms', () => {
        expect(getBackoffMs(1)).toBe(2000);
    });

    it('attempt 2 → 4000ms', () => {
        expect(getBackoffMs(2)).toBe(4000);
    });

    it('attempt 3 → 8000ms (cap)', () => {
        expect(getBackoffMs(3)).toBe(8000);
    });

    it('attempt 10 → 8000ms (max cap)', () => {
        expect(getBackoffMs(10)).toBe(8000);
    });
});

// ===================================
// apiCall — retry logic
// ===================================
describe('apiCall — retry logic', () => {
    beforeEach(() => {
        vi.useFakeTimers({ shouldAdvanceTime: true });
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('trả data khi thành công lần đầu', async () => {
        const fn = vi.fn().mockResolvedValue({ data: { id: 1 }, error: null });
        const result = await apiCall(fn);
        expect(result).toEqual({ data: { id: 1 }, error: null });
        expect(fn).toHaveBeenCalledTimes(1);
    });

    it('retry khi network error rồi thành công', async () => {
        const fn = vi.fn()
            .mockRejectedValueOnce(new Error('Failed to fetch'))
            .mockResolvedValue({ data: { ok: true }, error: null });

        const result = await apiCall(fn, { retries: 3 });
        expect(result).toEqual({ data: { ok: true }, error: null });
        expect(fn).toHaveBeenCalledTimes(2);
    });

    it('retry khi Supabase error field là retryable', async () => {
        const fn = vi.fn()
            .mockResolvedValueOnce({ data: null, error: { message: 'Failed to fetch', code: '' } })
            .mockResolvedValue({ data: { ok: true }, error: null });

        const result = await apiCall(fn, { retries: 3 });
        expect(result).toEqual({ data: { ok: true }, error: null });
        expect(fn).toHaveBeenCalledTimes(2);
    });

    it('KHÔNG retry khi error không retryable (thrown)', async () => {
        const fn = vi.fn().mockRejectedValue(new Error('Invalid input'));

        await expect(apiCall(fn, { retries: 3 })).rejects.toThrow('Invalid input');
        expect(fn).toHaveBeenCalledTimes(1);
    });

    it('KHÔNG retry khi Supabase error field không retryable', async () => {
        const nonRetryable = { data: null, error: { message: 'permission denied', code: '403' } };
        const fn = vi.fn().mockResolvedValue(nonRetryable);

        const result = await apiCall(fn, { retries: 3 });
        expect(result).toEqual(nonRetryable);
        expect(fn).toHaveBeenCalledTimes(1);
    });

    it('throw sau khi hết retries', async () => {
        const fn = vi.fn().mockRejectedValue(new Error('Failed to fetch'));

        await expect(apiCall(fn, { retries: 2 })).rejects.toThrow('Failed to fetch');
        expect(fn).toHaveBeenCalledTimes(3); // 1 original + 2 retries
    });

    it('gọi onRetry callback mỗi lần retry', async () => {
        const onRetry = vi.fn();
        const fn = vi.fn()
            .mockRejectedValueOnce(new Error('Failed to fetch'))
            .mockRejectedValueOnce(new Error('Failed to fetch'))
            .mockResolvedValue({ data: { ok: true }, error: null });

        await apiCall(fn, { retries: 3, onRetry });
        expect(onRetry).toHaveBeenCalledTimes(2);
        expect(onRetry).toHaveBeenCalledWith(1, expect.any(Error));
        expect(onRetry).toHaveBeenCalledWith(2, expect.any(Error));
    });

    it('retries=0 → không retry', async () => {
        const fn = vi.fn().mockRejectedValue(new Error('Failed to fetch'));

        await expect(apiCall(fn, { retries: 0 })).rejects.toThrow('Failed to fetch');
        expect(fn).toHaveBeenCalledTimes(1);
    });

    it('trả Supabase error khi hết retries (error field)', async () => {
        const retryableErr = { data: null, error: { message: 'Failed to fetch' } };
        const fn = vi.fn().mockResolvedValue(retryableErr);

        const result = await apiCall(fn, { retries: 1 });
        // Sau 2 lần (1 gốc + 1 retry), trả error field
        expect(result).toEqual(retryableErr);
        expect(fn).toHaveBeenCalledTimes(2);
    });
});

// ===================================
// getVietnameseErrorMessage
// ===================================
describe('getVietnameseErrorMessage — dịch lỗi sang tiếng Việt', () => {
    it('network error → thông báo kết nối', () => {
        const msg = getVietnameseErrorMessage(new Error('Failed to fetch'));
        expect(msg).toContain('kết nối');
    });

    it('timeout → thông báo quá lâu', () => {
        const msg = getVietnameseErrorMessage(new Error('Request timeout'));
        expect(msg).toContain('quá lâu');
    });

    it('rate limit → thông báo quá nhiều', () => {
        const msg = getVietnameseErrorMessage(new Error('Too many requests'));
        expect(msg).toContain('Quá nhiều');
    });

    it('unauthorized → thông báo đăng nhập', () => {
        const msg = getVietnameseErrorMessage(new Error('Unauthorized access'));
        expect(msg).toContain('đăng nhập');
    });

    it('forbidden → thông báo quyền', () => {
        const msg = getVietnameseErrorMessage(new Error('Permission denied (403)'));
        expect(msg).toContain('quyền');
    });

    it('server 500 → thông báo máy chủ', () => {
        const msg = getVietnameseErrorMessage(new Error('Internal server error'));
        expect(msg).toContain('Máy chủ');
    });

    it('error không rõ → thông báo generic', () => {
        const msg = getVietnameseErrorMessage(new Error('Something weird'));
        expect(msg).toContain('thử lại');
    });

    it('null error → thông báo không xác định', () => {
        const msg = getVietnameseErrorMessage(null);
        expect(msg).toContain('không xác định');
    });
});

// ===================================
// handleApiError
// ===================================
describe('handleApiError — log + toast', () => {
    it('gọi toastFn với message tiếng Việt', () => {
        const toastFn = vi.fn();
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

        handleApiError(new Error('Failed to fetch'), 'Gửi đơn', toastFn);

        expect(toastFn).toHaveBeenCalledWith(expect.stringContaining('kết nối'), false);
        expect(consoleSpy).toHaveBeenCalled();

        consoleSpy.mockRestore();
    });

    it('log context + error', () => {
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
        const error = new Error('test error');

        handleApiError(error, 'Test context', null);

        expect(consoleSpy).toHaveBeenCalledWith('[Test context]', error);
        consoleSpy.mockRestore();
    });

    it('trả message cho caller', () => {
        vi.spyOn(console, 'error').mockImplementation(() => {});
        const msg = handleApiError(new Error('timeout'), 'ctx', vi.fn());
        expect(msg).toContain('quá lâu');
        console.error.mockRestore();
    });

    it('không crash khi toastFn không phải function', () => {
        vi.spyOn(console, 'error').mockImplementation(() => {});
        expect(() => handleApiError(new Error('test'), 'ctx', null)).not.toThrow();
        expect(() => handleApiError(new Error('test'), 'ctx', undefined)).not.toThrow();
        console.error.mockRestore();
    });
});

// ===================================
// fireAndForget
// ===================================
describe('fireAndForget — background calls', () => {
    it('không throw khi fn thành công', () => {
        expect(() => fireAndForget(() => Promise.resolve())).not.toThrow();
    });

    it('không throw khi fn reject', () => {
        vi.spyOn(console, 'warn').mockImplementation(() => {});
        expect(() => fireAndForget(() => Promise.reject(new Error('fail')))).not.toThrow();
        // Wait for async catch
        return new Promise(resolve => setTimeout(() => {
            expect(console.warn).toHaveBeenCalled();
            console.warn.mockRestore();
            resolve();
        }, 10));
    });

    it('không throw khi fn throw sync', () => {
        vi.spyOn(console, 'warn').mockImplementation(() => {});
        expect(() => fireAndForget(() => { throw new Error('sync fail'); })).not.toThrow();
        expect(console.warn).toHaveBeenCalled();
        console.warn.mockRestore();
    });

    it('gọi fn đúng 1 lần', () => {
        const fn = vi.fn().mockReturnValue(Promise.resolve());
        fireAndForget(fn);
        expect(fn).toHaveBeenCalledTimes(1);
    });
});

// ===================================
// initNetworkStatus
// ===================================
describe('initNetworkStatus — online/offline detection', () => {
    it('gọi onOffline khi mất mạng', () => {
        const onOffline = vi.fn();
        const cleanup = initNetworkStatus(onOffline, vi.fn());

        window.dispatchEvent(new Event('offline'));
        expect(onOffline).toHaveBeenCalledTimes(1);

        cleanup();
    });

    it('gọi onOnline khi có mạng lại', () => {
        const onOnline = vi.fn();
        const cleanup = initNetworkStatus(vi.fn(), onOnline);

        window.dispatchEvent(new Event('online'));
        expect(onOnline).toHaveBeenCalledTimes(1);

        cleanup();
    });

    it('cleanup removes listeners', () => {
        const onOffline = vi.fn();
        const onOnline = vi.fn();
        const cleanup = initNetworkStatus(onOffline, onOnline);

        cleanup();

        window.dispatchEvent(new Event('offline'));
        window.dispatchEvent(new Event('online'));

        expect(onOffline).not.toHaveBeenCalled();
        expect(onOnline).not.toHaveBeenCalled();
    });

    it('không crash khi callback null', () => {
        const cleanup = initNetworkStatus(null, null);
        expect(() => window.dispatchEvent(new Event('offline'))).not.toThrow();
        expect(() => window.dispatchEvent(new Event('online'))).not.toThrow();
        cleanup();
    });
});
