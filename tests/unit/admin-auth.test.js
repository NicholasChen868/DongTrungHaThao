import { describe, it, expect, vi, beforeEach } from 'vitest';
import { supabase } from '../../src/supabase.js';
import {
    getSessionToken,
    isSessionValid,
    saveSession,
    clearSession,
    adminLogin,
    adminLogout,
} from '../../src/admin-session.js';

// ===================================
// getSessionToken
// ===================================
describe('getSessionToken — lấy token từ sessionStorage', () => {
    it('trả empty string khi chưa login', () => {
        expect(getSessionToken()).toBe('');
    });

    it('trả token khi đã lưu', () => {
        sessionStorage.setItem('admin_session_token', 'abc-123');
        expect(getSessionToken()).toBe('abc-123');
    });
});

// ===================================
// isSessionValid
// ===================================
describe('isSessionValid — check session client-side', () => {
    it('false khi chưa có token', () => {
        expect(isSessionValid()).toBe(false);
    });

    it('true khi có token + chưa hết hạn', () => {
        sessionStorage.setItem('admin_session_token', 'test-token');
        sessionStorage.setItem('admin_session_expires', String(Date.now() + 60000));
        expect(isSessionValid()).toBe(true);
    });

    it('false khi token đã hết hạn', () => {
        sessionStorage.setItem('admin_session_token', 'expired-token');
        sessionStorage.setItem('admin_session_expires', String(Date.now() - 1000));
        expect(isSessionValid()).toBe(false);
        // Phải clear session
        expect(sessionStorage.getItem('admin_session_token')).toBeNull();
    });

    it('false khi chỉ có token mà không có expires', () => {
        sessionStorage.setItem('admin_session_token', 'no-expiry');
        // expires_at = 0 → luôn expired
        expect(isSessionValid()).toBe(false);
    });
});

// ===================================
// saveSession / clearSession
// ===================================
describe('saveSession + clearSession', () => {
    it('saveSession lưu token + expires', () => {
        saveSession('my-uuid', '2026-02-23T12:00:00Z');
        expect(sessionStorage.getItem('admin_session_token')).toBe('my-uuid');
        expect(parseInt(sessionStorage.getItem('admin_session_expires'))).toBeGreaterThan(0);
    });

    it('saveSession nhận timestamp number', () => {
        const ts = Date.now() + 60000;
        saveSession('uuid-2', ts);
        expect(sessionStorage.getItem('admin_session_expires')).toBe(String(ts));
    });

    it('clearSession xóa tất cả keys (cả legacy)', () => {
        sessionStorage.setItem('admin_session_token', 'token');
        sessionStorage.setItem('admin_session_expires', '123');
        sessionStorage.setItem('admin_hash', 'old-hash');
        sessionStorage.setItem('admin_session_ts', 'old-ts');

        clearSession();

        expect(sessionStorage.getItem('admin_session_token')).toBeNull();
        expect(sessionStorage.getItem('admin_session_expires')).toBeNull();
        expect(sessionStorage.getItem('admin_hash')).toBeNull();
        expect(sessionStorage.getItem('admin_session_ts')).toBeNull();
    });
});

// ===================================
// adminLogin
// ===================================
describe('adminLogin — login qua RPC', () => {
    beforeEach(() => {
        supabase.rpc.mockReset();
    });

    it('login thành công → lưu session + trả ok', async () => {
        supabase.rpc.mockResolvedValue({
            data: {
                ok: true,
                session_token: 'new-uuid-token',
                expires_at: '2026-02-23T12:30:00Z',
            },
            error: null,
        });

        const result = await adminLogin(supabase, 'valid-hash');
        expect(result.ok).toBe(true);
        expect(sessionStorage.getItem('admin_session_token')).toBe('new-uuid-token');
        expect(supabase.rpc).toHaveBeenCalledWith('admin_login', { p_admin_hash: 'valid-hash' });
    });

    it('login thất bại → trả error message', async () => {
        supabase.rpc.mockResolvedValue({
            data: null,
            error: { message: 'Mật khẩu không đúng.' },
        });

        const result = await adminLogin(supabase, 'wrong-hash');
        expect(result.ok).toBe(false);
        expect(result.error).toContain('Mật khẩu');
        expect(sessionStorage.getItem('admin_session_token')).toBeNull();
    });

    it('login rate limited → trả error', async () => {
        supabase.rpc.mockResolvedValue({
            data: null,
            error: { message: 'Quá nhiều lần thử đăng nhập. Đợi 5 phút.' },
        });

        const result = await adminLogin(supabase, 'any-hash');
        expect(result.ok).toBe(false);
        expect(result.error).toContain('Quá nhiều');
    });

    it('RPC trả data nhưng không có session_token → thất bại', async () => {
        supabase.rpc.mockResolvedValue({
            data: { ok: false },
            error: null,
        });

        const result = await adminLogin(supabase, 'hash');
        expect(result.ok).toBe(false);
    });
});

// ===================================
// adminLogout
// ===================================
describe('adminLogout — logout + xóa session', () => {
    beforeEach(() => {
        supabase.rpc.mockReset();
    });

    it('gọi admin_logout RPC + xóa session', async () => {
        sessionStorage.setItem('admin_session_token', 'token-to-logout');
        sessionStorage.setItem('admin_session_expires', String(Date.now() + 60000));
        supabase.rpc.mockResolvedValue({ data: null, error: null });

        await adminLogout(supabase);

        expect(supabase.rpc).toHaveBeenCalledWith('admin_logout', { p_session_token: 'token-to-logout' });
        expect(sessionStorage.getItem('admin_session_token')).toBeNull();
    });

    it('xóa session ngay cả khi RPC fail', async () => {
        sessionStorage.setItem('admin_session_token', 'fail-token');
        supabase.rpc.mockRejectedValue(new Error('Network error'));

        await adminLogout(supabase);

        expect(sessionStorage.getItem('admin_session_token')).toBeNull();
    });

    it('không crash khi chưa có token', async () => {
        await expect(adminLogout(supabase)).resolves.not.toThrow();
    });
});
