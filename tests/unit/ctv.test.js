import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { initRefTracking, getAutoRef, validateCtvCode, registerCTV, getCTVDashboard, getShareURL } from '../../src/ctv.js';
import { supabase } from '../../src/supabase.js';

// Access the chainable query builder from the mock
const queryBuilder = supabase.__queryBuilder;

describe('getAutoRef', () => {
    it('trả null khi chưa có ref cookie', () => {
        expect(getAutoRef()).toBeNull();
    });

    it('trả ref code khi cookie hợp lệ', () => {
        const data = { code: 'CTV001', ts: Date.now() };
        localStorage.setItem('mdd_ref', JSON.stringify(data));
        expect(getAutoRef()).toBe('CTV001');
    });

    it('trả null khi cookie hết hạn (>30 ngày)', () => {
        const data = { code: 'CTV001', ts: Date.now() - 31 * 24 * 60 * 60 * 1000 };
        localStorage.setItem('mdd_ref', JSON.stringify(data));
        expect(getAutoRef()).toBeNull();
        // Cookie hết hạn bị xóa
        expect(localStorage.getItem('mdd_ref')).toBeNull();
    });

    it('trả null khi cookie bị corrupted', () => {
        localStorage.setItem('mdd_ref', 'invalid-json{{{');
        expect(getAutoRef()).toBeNull();
    });

    it('trả code khi cookie vừa đúng 30 ngày', () => {
        // Exactly 30 days — should still be valid (not > 30 days)
        const data = { code: 'CTV002', ts: Date.now() - 29 * 24 * 60 * 60 * 1000 };
        localStorage.setItem('mdd_ref', JSON.stringify(data));
        expect(getAutoRef()).toBe('CTV002');
    });
});

describe('initRefTracking', () => {
    beforeEach(() => {
        supabase.rpc.mockReset();
        supabase.rpc.mockResolvedValue({ data: null, error: null });
    });

    it('không làm gì khi URL không có ?ref=', () => {
        initRefTracking();
        expect(localStorage.getItem('mdd_ref')).toBeNull();
    });
});

describe('validateCtvCode', () => {
    beforeEach(() => {
        supabase.from.mockClear();
        queryBuilder.select.mockClear();
        queryBuilder.eq.mockClear();
        queryBuilder.single.mockReset();
        queryBuilder.single.mockResolvedValue({ data: null, error: null });
    });

    it('trả code nguyên gốc nếu code null', async () => {
        const result = await validateCtvCode(null, '0912345678');
        expect(result).toBeNull();
    });

    it('trả code nguyên gốc nếu customerPhone null', async () => {
        const result = await validateCtvCode('CTV001', null);
        expect(result).toBe('CTV001');
    });

    it('chặn self-referral (phone match)', async () => {
        queryBuilder.single.mockResolvedValueOnce({
            data: { phone: '0912345678' },
            error: null,
        });

        const result = await validateCtvCode('CTV001', '0912345678');
        expect(result).toBeNull();
    });

    it('chặn self-referral với +84 normalization', async () => {
        queryBuilder.single.mockResolvedValueOnce({
            data: { phone: '+84912345678' },
            error: null,
        });

        const result = await validateCtvCode('CTV001', '0912345678');
        expect(result).toBeNull();
    });

    it('cho phép code khi phone khác nhau', async () => {
        queryBuilder.single.mockResolvedValueOnce({
            data: { phone: '0987654321' },
            error: null,
        });

        const result = await validateCtvCode('CTV001', '0912345678');
        expect(result).toBe('CTV001');
    });

    it('trả code khi CTV không tìm thấy (let backend handle)', async () => {
        queryBuilder.single.mockResolvedValueOnce({
            data: null,
            error: { message: 'not found' },
        });

        const result = await validateCtvCode('CTV999', '0912345678');
        expect(result).toBe('CTV999');
    });

    it('trả code khi supabase throw error', async () => {
        queryBuilder.single.mockRejectedValueOnce(new Error('Network error'));

        const result = await validateCtvCode('CTV001', '0912345678');
        expect(result).toBe('CTV001');
    });
});

describe('registerCTV', () => {
    beforeEach(() => {
        supabase.rpc.mockReset();
        supabase.rpc.mockResolvedValue({ data: null, error: null });
    });

    it('đăng ký thành công → lưu ref code', async () => {
        supabase.rpc.mockResolvedValueOnce({
            data: { ok: true, referral_code: 'CTV_NEW_001' },
            error: null,
        });

        const result = await registerCTV('Nguyễn Văn A', '0912345678', 'a@test.com');
        expect(result.ok).toBe(true);
        expect(result.referral_code).toBe('CTV_NEW_001');
        expect(localStorage.getItem('ctv_ref_code')).toBe('CTV_NEW_001');
    });

    it('trả error khi RPC fail', async () => {
        supabase.rpc.mockResolvedValueOnce({
            data: null,
            error: { message: 'Phone already exists' },
        });

        const result = await registerCTV('Test', '0912345678', null);
        expect(result.ok).toBe(false);
    });

    it('gửi email null khi không có email', async () => {
        supabase.rpc.mockResolvedValueOnce({
            data: { ok: true, referral_code: 'CTV002' },
            error: null,
        });

        await registerCTV('Test', '0912345678', '');
        expect(supabase.rpc).toHaveBeenCalledWith('register_ctv', expect.objectContaining({
            p_email: null,
        }));
    });

    it('trả error khi data.ok = false', async () => {
        supabase.rpc.mockResolvedValueOnce({
            data: { ok: false },
            error: null,
        });

        const result = await registerCTV('Test', '0912345678', null);
        expect(result.ok).toBe(false);
    });
});

describe('getCTVDashboard', () => {
    beforeEach(() => {
        supabase.rpc.mockReset();
        supabase.rpc.mockResolvedValue({ data: null, error: null });
    });

    it('fetch dashboard data thành công', async () => {
        const mockData = { ok: true, name: 'CTV Hùng', total_points: 500 };
        supabase.rpc.mockResolvedValueOnce({ data: mockData, error: null });

        const result = await getCTVDashboard('CTV001');
        expect(result).toEqual(mockData);
        expect(supabase.rpc).toHaveBeenCalledWith('get_ctv_dashboard', { p_ref_code: 'CTV001' });
    });

    it('trả error khi RPC fail', async () => {
        supabase.rpc.mockResolvedValueOnce({
            data: null,
            error: { message: 'Not found' },
        });

        const result = await getCTVDashboard('INVALID');
        expect(result.ok).toBe(false);
    });
});

describe('getShareURL', () => {
    it('trả origin khi chưa có ref code', () => {
        localStorage.removeItem('ctv_ref_code');
        const url = getShareURL('product', 'p1');
        expect(url).toBe(window.location.origin);
    });

    it('trả URL với ref param khi có ref code', () => {
        localStorage.setItem('ctv_ref_code', 'CTV001');
        const url = getShareURL('story', '3');
        expect(url).toContain('ref=CTV001');
        expect(url).toContain('t=story');
        expect(url).toContain('id=3');
    });

    it('trả URL không có id khi contentId null', () => {
        localStorage.setItem('ctv_ref_code', 'CTV001');
        const url = getShareURL('page', null);
        expect(url).toContain('ref=CTV001');
        expect(url).not.toContain('id=');
    });
});
