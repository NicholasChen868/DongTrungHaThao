/**
 * Integration Test: CTV Flow
 * Tests CTV registration, ref tracking, dashboard, and anti-self-referral.
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { supabase } from '../../src/supabase.js';

const queryBuilder = supabase.__queryBuilder;

import {
    registerCTV,
    getAutoRef,
    validateCtvCode,
    getCTVDashboard,
    getShareURL,
    handleCTVRegister,
} from '../../src/ctv.js';

describe('CTV Registration Flow', () => {
    beforeEach(() => {
        supabase.rpc.mockReset();
        supabase.rpc.mockResolvedValue({ data: null, error: null });
    });

    it('đăng ký CTV mới → lưu ref code → check dashboard', async () => {
        // Step 1: Register
        supabase.rpc.mockResolvedValueOnce({
            data: { ok: true, referral_code: 'CTV_FLOW_001', name: 'Test CTV' },
            error: null,
        });

        const regResult = await registerCTV('Test CTV', '0912345678', 'test@email.com');
        expect(regResult.ok).toBe(true);
        expect(regResult.referral_code).toBe('CTV_FLOW_001');

        // Step 2: Ref code saved
        expect(localStorage.getItem('ctv_ref_code')).toBe('CTV_FLOW_001');

        // Step 3: Fetch dashboard
        const dashData = {
            ok: true,
            name: 'Test CTV',
            total_points: 0,
            pending_points: 0,
            available_vnd: 0,
            total_clicks: 0,
            referral_code: 'CTV_FLOW_001',
            tier: 'silver',
            today_points: 0,
        };
        supabase.rpc.mockResolvedValueOnce({ data: dashData, error: null });

        const dashboard = await getCTVDashboard('CTV_FLOW_001');
        expect(dashboard.ok).toBe(true);
        expect(dashboard.total_points).toBe(0);
    });

    it('CTV đã tồn tại → trả existing=true', async () => {
        supabase.rpc.mockResolvedValueOnce({
            data: { ok: true, existing: true, referral_code: 'CTV_EXIST' },
            error: null,
        });

        const result = await registerCTV('Existing CTV', '0987654321', null);
        expect(result.ok).toBe(true);
        expect(result.existing).toBe(true);
        expect(result.referral_code).toBe('CTV_EXIST');
    });

    it('đăng ký thất bại → trả error, không lưu ref', async () => {
        supabase.rpc.mockResolvedValueOnce({
            data: null,
            error: { message: 'Số điện thoại đã được đăng ký' },
        });

        const result = await registerCTV('Fail CTV', '0912345678', null);
        expect(result.ok).toBe(false);
        expect(localStorage.getItem('ctv_ref_code')).toBeNull();
    });
});

describe('handleCTVRegister (Dashboard page)', () => {
    beforeEach(() => {
        supabase.rpc.mockReset();
        supabase.rpc.mockResolvedValue({ data: null, error: null });
    });

    it('đăng ký thành công với referrer code', async () => {
        supabase.rpc.mockResolvedValueOnce({
            data: { ok: true, referral_code: 'CTV_NEW_002' },
            error: null,
        });

        const result = await handleCTVRegister({
            name: 'New CTV',
            phone: '0912345678',
            email: 'new@test.com',
            passwordHash: 'abc123hash',
            referrerCode: 'CTV_REF_001',
        });

        expect(result.ok).toBe(true);
        expect(supabase.rpc).toHaveBeenCalledWith('register_ctv', expect.objectContaining({
            p_name: 'New CTV',
            p_phone: '0912345678',
            p_email: 'new@test.com',
            p_password_hash: 'abc123hash',
            p_referrer_code: 'CTV_REF_001',
        }));
        expect(localStorage.getItem('ctv_ref_code')).toBe('CTV_NEW_002');
    });

    it('đăng ký không email, không referrer', async () => {
        supabase.rpc.mockResolvedValueOnce({
            data: { ok: true, referral_code: 'CTV_003' },
            error: null,
        });

        await handleCTVRegister({
            name: 'Simple CTV',
            phone: '0987654321',
            email: '',
            passwordHash: 'hash',
            referrerCode: null,
        });

        expect(supabase.rpc).toHaveBeenCalledWith('register_ctv', expect.objectContaining({
            p_email: null,
            p_referrer_code: null,
        }));
    });
});

describe('Ref Tracking + Anti Self-Referral', () => {
    beforeEach(() => {
        supabase.from.mockClear();
        queryBuilder.single.mockReset();
        queryBuilder.single.mockResolvedValue({ data: null, error: null });
    });

    it('ref cookie → auto-fill → anti-self-referral chặn', async () => {
        // Step 1: Simulate ref cookie from tracking
        const refData = { code: 'CTV_SELF', ts: Date.now() };
        localStorage.setItem('mdd_ref', JSON.stringify(refData));

        // Step 2: Get auto ref
        const autoRef = getAutoRef();
        expect(autoRef).toBe('CTV_SELF');

        // Step 3: Validate — CTV phone matches customer phone
        queryBuilder.single.mockResolvedValueOnce({
            data: { phone: '0912345678' },
            error: null,
        });

        const validatedCode = await validateCtvCode('CTV_SELF', '0912345678');
        expect(validatedCode).toBeNull(); // Blocked!
    });

    it('ref cookie → auto-fill → phone khác → cho phép', async () => {
        const refData = { code: 'CTV_OTHER', ts: Date.now() };
        localStorage.setItem('mdd_ref', JSON.stringify(refData));

        const autoRef = getAutoRef();
        expect(autoRef).toBe('CTV_OTHER');

        queryBuilder.single.mockResolvedValueOnce({
            data: { phone: '0987654321' },
            error: null,
        });

        const validatedCode = await validateCtvCode('CTV_OTHER', '0912345678');
        expect(validatedCode).toBe('CTV_OTHER'); // Allowed
    });

    it('ref cookie hết hạn → không auto-fill', () => {
        const expired = { code: 'CTV_OLD', ts: Date.now() - 31 * 24 * 60 * 60 * 1000 };
        localStorage.setItem('mdd_ref', JSON.stringify(expired));

        const autoRef = getAutoRef();
        expect(autoRef).toBeNull();
    });

    it('+84 phone normalization trong anti-self-referral', async () => {
        queryBuilder.single.mockResolvedValueOnce({
            data: { phone: '+84912345678' },
            error: null,
        });

        const result = await validateCtvCode('CTV001', '0912345678');
        expect(result).toBeNull(); // Normalized +84 → 0, matches
    });

    it('phone có spaces được normalize', async () => {
        queryBuilder.single.mockResolvedValueOnce({
            data: { phone: '091 234 5678' },
            error: null,
        });

        const result = await validateCtvCode('CTV001', '0912345678');
        expect(result).toBeNull(); // Spaces removed, matches
    });
});

describe('Share URL Generation', () => {
    it('CTV tạo share URL → chứa ref code', () => {
        localStorage.setItem('ctv_ref_code', 'CTV_SHARE_001');

        const url = getShareURL('product', 'dtht-001');
        expect(url).toContain('ref=CTV_SHARE_001');
        expect(url).toContain('t=product');
        expect(url).toContain('id=dtht-001');
    });

    it('share URL cho story', () => {
        localStorage.setItem('ctv_ref_code', 'CTV_SHARE_001');

        const url = getShareURL('story', '5');
        expect(url).toContain('t=story');
        expect(url).toContain('id=5');
    });

    it('không có ref code → trả origin', () => {
        // localStorage cleared by beforeEach
        const url = getShareURL('product', 'p1');
        expect(url).toBe(window.location.origin);
    });
});

describe('CTV Dashboard Fetch', () => {
    beforeEach(() => {
        supabase.rpc.mockReset();
        supabase.rpc.mockResolvedValue({ data: null, error: null });
    });

    it('fetch dashboard thành công → trả đầy đủ data', async () => {
        const mockDash = {
            ok: true,
            name: 'CTV Pro',
            total_points: 500,
            pending_points: 50,
            available_vnd: 50000,
            total_clicks: 120,
            referral_code: 'CTV_PRO',
            tier: 'gold',
            today_points: 15,
        };
        supabase.rpc.mockResolvedValueOnce({ data: mockDash, error: null });

        const result = await getCTVDashboard('CTV_PRO');
        expect(result.ok).toBe(true);
        expect(result.total_points).toBe(500);
        expect(result.tier).toBe('gold');
    });

    it('fetch dashboard thất bại → trả error', async () => {
        supabase.rpc.mockResolvedValueOnce({
            data: null,
            error: { message: 'Invalid ref code' },
        });

        const result = await getCTVDashboard('INVALID');
        expect(result.ok).toBe(false);
    });

    it('gọi đúng RPC function', async () => {
        supabase.rpc.mockResolvedValueOnce({ data: { ok: true }, error: null });
        await getCTVDashboard('CTV_CHECK');

        expect(supabase.rpc).toHaveBeenCalledWith('get_ctv_dashboard', {
            p_ref_code: 'CTV_CHECK',
        });
    });
});
