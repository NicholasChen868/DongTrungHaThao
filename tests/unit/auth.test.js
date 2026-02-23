import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getCurrentUser, setCurrentUser, logout, getRoleConfig, sha256, loginUser } from '../../src/auth.js';
import { supabase } from '../../src/supabase.js';

describe('getCurrentUser', () => {
    it('trả null khi chưa có session', () => {
        expect(getCurrentUser()).toBeNull();
    });

    it('trả user object khi có session hợp lệ', () => {
        const user = { name: 'Hùng', role: 'member' };
        localStorage.setItem('maldala_user', JSON.stringify(user));
        localStorage.setItem('maldala_session_expiry', String(Date.now() + 86400000));
        expect(getCurrentUser()).toEqual(user);
    });

    it('trả null và xóa session khi hết hạn', () => {
        const user = { name: 'Hùng', role: 'member' };
        localStorage.setItem('maldala_user', JSON.stringify(user));
        localStorage.setItem('maldala_session_expiry', String(Date.now() - 1000));
        expect(getCurrentUser()).toBeNull();
        expect(localStorage.getItem('maldala_user')).toBeNull();
    });

    it('trả null khi localStorage bị corrupted', () => {
        localStorage.setItem('maldala_user', 'not-valid-json{{{');
        localStorage.setItem('maldala_session_expiry', String(Date.now() + 86400000));
        expect(getCurrentUser()).toBeNull();
    });

    it('trả user khi không có expiry key (backward compat)', () => {
        const user = { name: 'Test', role: 'guest' };
        localStorage.setItem('maldala_user', JSON.stringify(user));
        expect(getCurrentUser()).toEqual(user);
    });
});

describe('setCurrentUser', () => {
    it('lưu user vào localStorage', () => {
        const user = { name: 'Lan', role: 'ctv', referral_code: 'CTV001' };
        setCurrentUser(user);
        expect(JSON.parse(localStorage.getItem('maldala_user'))).toEqual(user);
    });

    it('lưu expiry timestamp', () => {
        setCurrentUser({ name: 'Test', role: 'member' });
        const expiry = parseInt(localStorage.getItem('maldala_session_expiry'));
        expect(expiry).toBeGreaterThan(Date.now());
        expect(expiry).toBeLessThanOrEqual(Date.now() + 86400001);
    });

    it('lưu referral_code vào ctv_ref_code', () => {
        setCurrentUser({ name: 'CTV', role: 'ctv', referral_code: 'ABC123' });
        expect(localStorage.getItem('ctv_ref_code')).toBe('ABC123');
    });

    it('không set ctv_ref_code nếu không có referral_code', () => {
        // localStorage is already cleared by setup.js beforeEach
        setCurrentUser({ name: 'Member', role: 'member' });
        // setCurrentUser only sets ctv_ref_code if referral_code exists
        // It should NOT be set because the user object has no referral_code
        expect(localStorage.getItem('ctv_ref_code')).toBeNull();
    });
});

describe('logout', () => {
    beforeEach(() => {
        // Mock window.location.reload
        Object.defineProperty(window, 'location', {
            value: { ...window.location, reload: vi.fn() },
            writable: true,
        });
    });

    it('xóa tất cả session keys', () => {
        localStorage.setItem('maldala_user', '{}');
        localStorage.setItem('maldala_session_expiry', '123');
        localStorage.setItem('ctv_ref_code', 'ABC');

        logout(true);

        expect(localStorage.getItem('maldala_user')).toBeNull();
        expect(localStorage.getItem('maldala_session_expiry')).toBeNull();
        expect(localStorage.getItem('ctv_ref_code')).toBeNull();
    });

    it('gọi reload khi redirect=true', () => {
        logout(true);
        expect(window.location.reload).toHaveBeenCalled();
    });

    it('không redirect khi redirect=false', () => {
        logout(false);
        expect(window.location.reload).not.toHaveBeenCalled();
    });
});

describe('getRoleConfig', () => {
    it('trả config cho admin', () => {
        const config = getRoleConfig('admin');
        expect(config.label).toBe('ADMIN');
        expect(config.icon).toBe('👑');
        expect(config.menuItems.length).toBeGreaterThan(0);
    });

    it('trả config cho ctv', () => {
        const config = getRoleConfig('ctv');
        expect(config.label).toBe('CTV');
        expect(config.icon).toBe('💰');
    });

    it('trả config cho member', () => {
        const config = getRoleConfig('member');
        expect(config.label).toBe('TV');
    });

    it('trả config cho btv', () => {
        const config = getRoleConfig('btv');
        expect(config.label).toBe('BTV');
    });

    it('trả config cho loyal_customer', () => {
        const config = getRoleConfig('loyal_customer');
        expect(config.label).toBe('KHTT');
    });

    it('trả guest config cho role không xác định', () => {
        const config = getRoleConfig('unknown_role');
        expect(config.label).toBe('');
        expect(config.menuItems).toEqual([]);
    });

    it('trả guest config cho undefined', () => {
        const config = getRoleConfig(undefined);
        expect(config.label).toBe('');
    });
});

describe('sha256', () => {
    it('hash string thành hex 64 ký tự', async () => {
        const hash = await sha256('matkhau');
        expect(hash).toMatch(/^[a-f0-9]{64}$/);
    });

    it('hash nhất quán (same input → same output)', async () => {
        const h1 = await sha256('test123');
        const h2 = await sha256('test123');
        expect(h1).toBe(h2);
    });

    it('hash khác nhau cho input khác nhau', async () => {
        const h1 = await sha256('password1');
        const h2 = await sha256('password2');
        expect(h1).not.toBe(h2);
    });

    it('hash empty string', async () => {
        const hash = await sha256('');
        expect(hash).toMatch(/^[a-f0-9]{64}$/);
    });
});

describe('loginUser', () => {
    beforeEach(() => {
        supabase.rpc.mockReset();
        // Ensure mock returns a promise by default
        supabase.rpc.mockResolvedValue({ data: null, error: null });
    });

    it('đăng nhập thành công qua authenticate_user', async () => {
        const mockUser = { ok: true, user_id: 1, name: 'Hùng', display_name: 'Hùng', role: 'member', total_points: 100 };
        supabase.rpc.mockResolvedValueOnce({ data: mockUser, error: null });

        const result = await loginUser('0912345678', 'matkhau');
        expect(result.ok).toBe(true);
        expect(result.name).toBe('Hùng');
        expect(supabase.rpc).toHaveBeenCalledWith('authenticate_user', expect.objectContaining({
            p_phone: '0912345678',
        }));
        // Session saved
        expect(localStorage.getItem('maldala_user')).not.toBeNull();
    });

    it('fallback sang authenticate_ctv khi member auth thất bại', async () => {
        // First call (authenticate_user) fails
        supabase.rpc.mockResolvedValueOnce({ data: { ok: false }, error: null });
        // Second call (authenticate_ctv) succeeds
        const ctvData = { ok: true, user_id: 2, name: 'CTV Lan', referral_code: 'CTV002', tier: 'silver' };
        supabase.rpc.mockResolvedValueOnce({ data: ctvData, error: null });

        const result = await loginUser('0987654321', 'password');
        expect(result.ok).toBe(true);
        expect(result.role).toBe('ctv');
        expect(supabase.rpc).toHaveBeenCalledTimes(2);
    });

    it('trả error khi cả 2 phương thức đều fail', async () => {
        supabase.rpc.mockResolvedValueOnce({ data: { ok: false, error: 'Sai mật khẩu' }, error: null });
        supabase.rpc.mockResolvedValueOnce({ data: { ok: false }, error: null });

        const result = await loginUser('0912345678', 'wrongpass');
        expect(result.ok).toBe(false);
        expect(result.error).toBeTruthy();
    });

    it('trả lỗi kết nối khi supabase throw', async () => {
        supabase.rpc.mockRejectedValueOnce(new Error('Network error'));

        const result = await loginUser('0912345678', 'pass');
        expect(result.ok).toBe(false);
        expect(result.error).toContain('kết nối');
    });
});
