/**
 * Integration Test: Order Flow
 * Tests the complete order flow from quantity selection to form submission.
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { supabase } from '../../src/supabase.js';

// Get the query builder from the mock
const queryBuilder = supabase.__queryBuilder;

// Import modules under test
import { initQuantitySelector, initOrderForm } from '../../src/modules/order-form.js';

const PRICING = {
    unit_price: 1450000,
    discounts: { 1: 0, 2: 0, 3: 5, 5: 10, 10: 15 },
    free_shipping_min: 3,
};

function setupOrderDOM() {
    document.body.innerHTML = `
        <!-- Quantity selector -->
        <button id="qtyMinus">-</button>
        <span id="qtyValue">1</span>
        <button id="qtyPlus">+</button>
        <span id="totalPrice">1,450,000₫</span>

        <!-- Order form -->
        <form id="orderForm">
            <input id="orderName" value="" />
            <input id="orderPhone" value="" />
            <input id="orderEmail" value="" />
            <input id="orderAddress" value="" />
            <select id="orderQty">
                <option value="1" selected>1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="5">5</option>
                <option value="10">10</option>
            </select>
            <input id="orderCtvCode" value="" />
            <textarea id="orderNote"></textarea>

            <div class="payment-option active">
                <input type="radio" name="paymentMethod" value="cod" checked />
            </div>
            <div class="payment-option">
                <input type="radio" name="paymentMethod" value="bank_transfer" />
            </div>

            <span id="orderSubtotal"></span>
            <span id="orderTotal"></span>
            <span id="orderShipping"></span>
            <span id="orderDiscount"></span>
            <div id="orderDiscountRow" style="display:none"></div>
            <div id="freeShipNote" style="display:none"></div>
            <div id="ctvAutoRefGroup" style="display:none"></div>
            <div id="ctvManualGroup"></div>
            <span id="ctvAutoRefText"></span>

            <button type="submit">Đặt Hàng</button>
        </form>

        <!-- Payment modal -->
        <div id="paymentModal">
            <button id="paymentModalClose">X</button>
            <span id="modalOrderCode"></span>
            <span id="modalAmount"></span>
            <span id="modalTransferContent"></span>
            <span id="modalBankAccount"></span>
            <img id="modalQrImage" src="" />
            <button class="copy-btn" data-copy="bankAccount">Copy</button>
            <button class="copy-btn" data-copy="transferContent">Copy</button>
        </div>
    `;
}

describe('Quantity Selector', () => {
    beforeEach(() => {
        setupOrderDOM();
    });

    it('khởi tạo thành công', () => {
        const product = { price: 1450000 };
        initQuantitySelector(product, PRICING);

        const qtyValue = document.getElementById('qtyValue');
        expect(qtyValue.textContent).toBe('1');
    });

    it('tăng số lượng khi click +', () => {
        const product = { price: 1450000 };
        initQuantitySelector(product, PRICING);

        const plusBtn = document.getElementById('qtyPlus');
        const qtyValue = document.getElementById('qtyValue');

        plusBtn.click();
        expect(qtyValue.textContent).toBe('2');

        plusBtn.click();
        expect(qtyValue.textContent).toBe('3');
    });

    it('giảm số lượng khi click -, không dưới 1', () => {
        const product = { price: 1450000 };
        initQuantitySelector(product, PRICING);

        const minusBtn = document.getElementById('qtyMinus');
        const plusBtn = document.getElementById('qtyPlus');
        const qtyValue = document.getElementById('qtyValue');

        // Go to 3 first
        plusBtn.click();
        plusBtn.click();
        expect(qtyValue.textContent).toBe('3');

        // Decrease
        minusBtn.click();
        expect(qtyValue.textContent).toBe('2');

        // Can't go below 1
        minusBtn.click();
        minusBtn.click();
        minusBtn.click();
        expect(qtyValue.textContent).toBe('1');
    });

    it('cập nhật giá khi thay đổi số lượng', () => {
        const product = { price: 1450000 };
        initQuantitySelector(product, PRICING);

        const plusBtn = document.getElementById('qtyPlus');
        const totalEl = document.getElementById('totalPrice');

        // qty=1, no discount — jsdom locale may use commas or dots
        expect(totalEl.textContent).toMatch(/1[.,]450[.,]000/);

        // qty=2, no discount
        plusBtn.click();
        expect(totalEl.textContent).toMatch(/2[.,]900[.,]000/);

        // qty=3, 5% discount
        plusBtn.click();
        // 3 * 1450000 = 4350000, 5% off = 4132500
        expect(totalEl.textContent).toMatch(/4[.,]132[.,]500/);
    });

    it('không init nếu thiếu DOM elements', () => {
        document.body.innerHTML = '';
        // Should not throw
        initQuantitySelector({ price: 1450000 }, PRICING);
    });
});

describe('Order Form — Summary Update', () => {
    let showToast;

    beforeEach(() => {
        setupOrderDOM();
        showToast = vi.fn();
        supabase.from.mockClear();
        queryBuilder.insert.mockClear();
        queryBuilder.select.mockClear();
        queryBuilder.single.mockClear();
    });

    it('cập nhật subtotal khi chọn số lượng', () => {
        initOrderForm(PRICING, showToast);

        const qtySelect = document.getElementById('orderQty');
        const subtotalEl = document.getElementById('orderSubtotal');

        qtySelect.value = '3';
        qtySelect.dispatchEvent(new Event('change'));

        // 3 * 1450000 = 4350000
        expect(subtotalEl.textContent).toContain('4.350.000');
    });

    it('hiện free ship khi qty >= 3', () => {
        initOrderForm(PRICING, showToast);

        const qtySelect = document.getElementById('orderQty');
        const freeShipNote = document.getElementById('freeShipNote');
        const shippingEl = document.getElementById('orderShipping');

        qtySelect.value = '3';
        qtySelect.dispatchEvent(new Event('change'));

        expect(freeShipNote.style.display).not.toBe('none');
        expect(shippingEl.textContent).toContain('Miễn phí');
    });

    it('hiện giảm giá khi qty >= 3', () => {
        initOrderForm(PRICING, showToast);

        const qtySelect = document.getElementById('orderQty');
        const discountRow = document.getElementById('orderDiscountRow');
        const discountEl = document.getElementById('orderDiscount');

        qtySelect.value = '5';
        qtySelect.dispatchEvent(new Event('change'));

        expect(discountRow.style.display).not.toBe('none');
        expect(discountEl.textContent).toContain('725.000');
    });
});

describe('Order Form — Submission', () => {
    let showToast;

    beforeEach(() => {
        setupOrderDOM();
        showToast = vi.fn();
        supabase.from.mockClear();
        queryBuilder.insert.mockClear();
        queryBuilder.select.mockClear();
        queryBuilder.single.mockReset();
        // Default: successful order creation
        queryBuilder.single.mockResolvedValue({
            data: { id: 1, order_code: 'MDD-000001' },
            error: null,
        });
        localStorage.clear();
    });

    it('chặn submit khi thiếu thông tin', async () => {
        initOrderForm(PRICING, showToast);

        const form = document.getElementById('orderForm');
        form.dispatchEvent(new Event('submit', { cancelable: true }));

        // Wait for async handling
        await vi.waitFor(() => {
            expect(showToast).toHaveBeenCalledWith(
                expect.stringContaining('điền đầy đủ'),
                false
            );
        });
    });

    it('chặn submit khi phone không hợp lệ', async () => {
        initOrderForm(PRICING, showToast);

        document.getElementById('orderName').value = 'Test User';
        document.getElementById('orderPhone').value = '12345'; // invalid
        document.getElementById('orderAddress').value = '123 Đường ABC';

        const form = document.getElementById('orderForm');
        form.dispatchEvent(new Event('submit', { cancelable: true }));

        await vi.waitFor(() => {
            expect(showToast).toHaveBeenCalledWith(
                expect.stringContaining('Số điện thoại không hợp lệ'),
                false
            );
        });
    });

    it('submit thành công gọi supabase.from("orders").insert()', async () => {
        initOrderForm(PRICING, showToast);

        document.getElementById('orderName').value = 'Nguyễn Văn Test';
        document.getElementById('orderPhone').value = '0912345678';
        document.getElementById('orderAddress').value = '123 Đường ABC, Q1, HCM';
        document.getElementById('orderQty').value = '1';

        const form = document.getElementById('orderForm');
        form.dispatchEvent(new Event('submit', { cancelable: true }));

        await vi.waitFor(() => {
            expect(supabase.from).toHaveBeenCalledWith('orders');
            expect(queryBuilder.insert).toHaveBeenCalledWith(
                expect.objectContaining({
                    customer_name: 'Nguyễn Văn Test',
                    phone: '0912345678',
                    quantity: 1,
                    status: 'pending',
                    payment_method: 'cod',
                })
            );
        });
    });

    it('lưu customer info vào localStorage sau khi đặt thành công', async () => {
        initOrderForm(PRICING, showToast);

        document.getElementById('orderName').value = 'Nguyễn Văn Test';
        document.getElementById('orderPhone').value = '0912345678';
        document.getElementById('orderAddress').value = '123 ABC';

        const form = document.getElementById('orderForm');
        form.dispatchEvent(new Event('submit', { cancelable: true }));

        await vi.waitFor(() => {
            const stored = JSON.parse(localStorage.getItem('mdd_customer'));
            expect(stored.name).toBe('Nguyễn Văn Test');
            expect(stored.phone).toBe('0912345678');
        });
    });

    it('hiện toast thành công với link tra cứu (COD)', async () => {
        initOrderForm(PRICING, showToast);

        document.getElementById('orderName').value = 'Test';
        document.getElementById('orderPhone').value = '0912345678';
        document.getElementById('orderAddress').value = '123 ABC';

        const form = document.getElementById('orderForm');
        form.dispatchEvent(new Event('submit', { cancelable: true }));

        await vi.waitFor(() => {
            expect(showToast).toHaveBeenCalledWith(
                expect.stringContaining('MDD-000001'),
                true,
                expect.objectContaining({ html: true })
            );
        });
    });

    it('rate limiting chặn submit liên tục', async () => {
        initOrderForm(PRICING, showToast);

        document.getElementById('orderName').value = 'Test';
        document.getElementById('orderPhone').value = '0912345678';
        document.getElementById('orderAddress').value = '123 ABC';

        const form = document.getElementById('orderForm');

        // Submit 3 lần (max = 3)
        form.dispatchEvent(new Event('submit', { cancelable: true }));
        await new Promise(r => setTimeout(r, 50));
        form.dispatchEvent(new Event('submit', { cancelable: true }));
        await new Promise(r => setTimeout(r, 50));
        form.dispatchEvent(new Event('submit', { cancelable: true }));
        await new Promise(r => setTimeout(r, 50));

        // Lần thứ 4 bị chặn
        form.dispatchEvent(new Event('submit', { cancelable: true }));

        await vi.waitFor(() => {
            const rateLimitCall = showToast.mock.calls.find(c =>
                typeof c[0] === 'string' && c[0].includes('Quá nhiều lần')
            );
            expect(rateLimitCall).toBeTruthy();
        });
    });
});
