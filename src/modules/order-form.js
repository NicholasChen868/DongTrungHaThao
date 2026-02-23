// ===================================
// ORDER FORM — Quantity selector, Order submission, Payment modal, CTV form
// ===================================
import { supabase } from '../supabase.js';
import { escapeHTML } from '../utils/sanitize.js';
import { checkRateLimit, recordAttempt } from '../utils/ratelimit.js';
import { registerCTV, getAutoRef, validateCtvCode } from '../ctv.js';

const SHIPPING_FEE = 30000;
const BANK_CONFIG = {
    bankId: 'MB',
    accountNo: '0903940171',
    accountName: 'MAL DALLA DUY DUC',
    template: 'compact2',
};

function calcOrderTotals(qty, PRICING) {
    const unitPrice = PRICING.unit_price || 1450000;
    const discountPercent = PRICING.discounts[qty] || 0;
    const subtotal = qty * unitPrice;
    const discountAmount = Math.round(subtotal * discountPercent / 100);
    const freeShip = qty >= (PRICING.free_shipping_min || 3);
    const shipping = freeShip ? 0 : SHIPPING_FEE;
    const total = subtotal - discountAmount + shipping;
    return { unitPrice, discountPercent, subtotal, discountAmount, shipping, total, freeShip };
}

export function initQuantitySelector(product, PRICING) {
    const minusBtn = document.getElementById('qtyMinus');
    const plusBtn = document.getElementById('qtyPlus');
    const valueEl = document.getElementById('qtyValue');
    const totalEl = document.getElementById('totalPrice');

    if (!minusBtn || !plusBtn || !product) return;

    let qty = 1;
    const unitPrice = PRICING.unit_price || product.price || 1450000;

    function updateQty(newQty) {
        qty = Math.max(1, Math.min(99, newQty));
        valueEl.textContent = qty;
        const discountPercent = PRICING.discounts[qty] || 0;
        const subtotal = qty * unitPrice;
        const total = Math.round(subtotal * (1 - discountPercent / 100));
        totalEl.textContent = total.toLocaleString('vi-VN') + '₫';
    }

    minusBtn.addEventListener('click', () => updateQty(qty - 1));
    plusBtn.addEventListener('click', () => updateQty(qty + 1));
}

export function initOrderForm(PRICING, showToast) {
    const form = document.getElementById('orderForm');
    const qtySelect = document.getElementById('orderQty');
    const subtotalEl = document.getElementById('orderSubtotal');
    const totalEl = document.getElementById('orderTotal');
    const shippingEl = document.getElementById('orderShipping');
    const discountEl = document.getElementById('orderDiscount');
    const discountRow = document.getElementById('orderDiscountRow');
    const freeShipNote = document.getElementById('freeShipNote');

    if (!form) return;

    const paymentOptions = document.querySelectorAll('.payment-option');
    paymentOptions.forEach(opt => {
        opt.addEventListener('click', () => {
            paymentOptions.forEach(o => o.classList.remove('active'));
            opt.classList.add('active');
            opt.querySelector('input[type="radio"]').checked = true;
        });
    });

    function updateSummary() {
        const qty = parseInt(qtySelect.value);
        const t = calcOrderTotals(qty, PRICING);
        subtotalEl.textContent = t.subtotal.toLocaleString('vi-VN') + '₫';
        shippingEl.textContent = t.freeShip ? 'Miễn phí' : t.shipping.toLocaleString('vi-VN') + '₫';
        if (t.freeShip && shippingEl) shippingEl.style.color = '#4ade80';
        else if (shippingEl) shippingEl.style.color = '';
        if (t.discountAmount > 0) {
            discountRow.style.display = '';
            discountEl.textContent = '-' + t.discountAmount.toLocaleString('vi-VN') + '₫';
        } else {
            discountRow.style.display = 'none';
        }
        freeShipNote.style.display = t.freeShip ? '' : 'none';
        totalEl.textContent = t.total.toLocaleString('vi-VN') + '₫';
    }

    qtySelect.addEventListener('change', updateSummary);
    updateSummary();

    const autoRef = getAutoRef();
    if (autoRef) {
        const autoGroup = document.getElementById('ctvAutoRefGroup');
        const manualGroup = document.getElementById('ctvManualGroup');
        const autoText = document.getElementById('ctvAutoRefText');
        if (autoGroup && manualGroup && autoText) {
            autoGroup.style.display = 'block';
            manualGroup.style.display = 'none';
            autoText.textContent = `Bạn được giới thiệu bởi ${autoRef}`;
        }
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const rl = checkRateLimit('order', 3, 60000);
        if (!rl.allowed) {
            showToast(`Quá nhiều lần gửi. Vui lòng đợi ${Math.ceil(rl.remainingMs / 1000)}s`, false);
            return;
        }
        recordAttempt('order', 60000);

        const name = document.getElementById('orderName').value.trim();
        const phone = document.getElementById('orderPhone').value.trim();
        const email = document.getElementById('orderEmail')?.value.trim() || null;
        const address = document.getElementById('orderAddress').value.trim();
        const qty = parseInt(qtySelect.value);
        const manualCode = document.getElementById('orderCtvCode')?.value.trim() || null;
        const rawCtvCode = manualCode || getAutoRef();
        const note = document.getElementById('orderNote')?.value.trim() || null;
        const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked')?.value || 'cod';

        if (!name || !phone || !address) {
            showToast('Vui lòng điền đầy đủ thông tin!', false);
            return;
        }

        const phoneClean = phone.replace(/[\s\-().]/g, '');
        if (!/^(0|\+84)\d{9,10}$/.test(phoneClean)) {
            showToast('Số điện thoại không hợp lệ!', false);
            return;
        }

        const t = calcOrderTotals(qty, PRICING);

        const submitBtn = form.querySelector('button[type="submit"]');
        const origText = submitBtn.textContent;
        submitBtn.disabled = true;
        submitBtn.textContent = 'Đang xử lý...';

        try {
            const ctvCode = await validateCtvCode(rawCtvCode, phone);

            const { data, error } = await supabase.from('orders').insert({
                customer_name: name,
                phone: phone,
                email: email,
                address: address,
                quantity: qty,
                unit_price: t.unitPrice,
                discount_percent: t.discountPercent,
                shipping_fee: t.shipping,
                total_amount: t.total,
                ctv_code: ctvCode,
                note: note,
                status: 'pending',
                payment_method: paymentMethod,
                payment_status: paymentMethod === 'cod' ? 'pending' : 'pending',
            }).select().single();

            if (error) throw error;

            try {
                localStorage.setItem('mdd_customer', JSON.stringify({ name, phone, lastOrder: Date.now() }));
            } catch (_e) { /* quota exceeded */ }

            if (paymentMethod === 'bank_transfer') {
                showPaymentModal(data.order_code || `MDD-${String(data.id).padStart(6, '0')}`, t.total);
                showToast(
                    `Đơn hàng <strong>${escapeHTML(data.order_code || '')}</strong> đã được tạo. Vui lòng hoàn tất thanh toán!`,
                    true,
                    { html: true, duration: 6000 }
                );
            } else {
                showToast(
                    `Cảm ơn ${escapeHTML(name)}! Đơn hàng <strong>${escapeHTML(data.order_code || '#' + data.id)}</strong> đã được ghi nhận.`
                    + `<br>Chúng tôi sẽ liên hệ xác nhận trong 30 phút.`
                    + `<br><a href="/tra-cuu.html" style="color:var(--gold-light);font-weight:600">Tra cứu đơn</a>`
                    + ` &nbsp;|&nbsp; <a href="/thanh-vien.html" style="color:var(--gold-light);font-weight:600">Thành viên</a>`,
                    true,
                    { html: true, duration: 8000 }
                );
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }

            form.reset();
            const codRadio = document.querySelector('input[name="paymentMethod"][value="cod"]');
            if (codRadio) {
                codRadio.checked = true;
                paymentOptions.forEach(o => o.classList.remove('active'));
                codRadio.closest('.payment-option')?.classList.add('active');
            }
            updateSummary();
        } catch (err) {
            console.error('Order submit error:', err);
            showToast('Đặt hàng thất bại. Vui lòng gọi Hotline hoặc thử lại!', false);
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = origText;
        }
    });
}

function showPaymentModal(orderCode, amount) {
    const modal = document.getElementById('paymentModal');
    if (!modal) return;

    const codeEl = document.getElementById('modalOrderCode');
    const amountEl = document.getElementById('modalAmount');
    const qrImg = document.getElementById('modalQrImage');
    const contentEl = document.getElementById('modalTransferContent');

    const transferContent = orderCode.replace(/-/g, '');

    if (codeEl) codeEl.textContent = orderCode;
    if (amountEl) amountEl.textContent = amount.toLocaleString('vi-VN') + '₫';
    if (contentEl) contentEl.textContent = transferContent;

    const qrUrl = `https://img.vietqr.io/image/${BANK_CONFIG.bankId}-${BANK_CONFIG.accountNo}-${BANK_CONFIG.template}.png?amount=${amount}&addInfo=${encodeURIComponent(transferContent)}&accountName=${encodeURIComponent(BANK_CONFIG.accountName)}`;
    if (qrImg) qrImg.src = qrUrl;

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

export function initPaymentModal(showToast) {
    const modal = document.getElementById('paymentModal');
    const closeBtn = document.getElementById('paymentModalClose');
    if (!modal) return;

    function closeModal() {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }

    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });

    modal.querySelectorAll('.copy-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
            const type = btn.dataset.copy;
            let text = '';
            if (type === 'bankAccount') {
                text = document.getElementById('modalBankAccount')?.textContent || '';
            } else if (type === 'transferContent') {
                text = document.getElementById('modalTransferContent')?.textContent || '';
            }
            try {
                await navigator.clipboard.writeText(text);
                const orig = btn.textContent;
                btn.textContent = '✓ Đã sao chép';
                btn.style.background = 'var(--gold-primary)';
                btn.style.color = '#0A0E1A';
                setTimeout(() => {
                    btn.textContent = orig;
                    btn.style.background = '';
                    btn.style.color = '';
                }, 2000);
            } catch (_e) {
                showToast('Không thể sao chép. Vui lòng copy thủ công.', false);
            }
        });
    });
}

export function initCtvForm(showToast) {
    const form = document.getElementById('ctvForm');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const rl = checkRateLimit('ctv_register', 3, 60000);
        if (!rl.allowed) {
            showToast(`Quá nhiều lần đăng ký. Vui lòng đợi ${Math.ceil(rl.remainingMs / 1000)}s`, false);
            return;
        }
        recordAttempt('ctv_register', 60000);

        const name = document.getElementById('ctvName').value;
        const phone = document.getElementById('ctvPhone')?.value;
        const email = document.getElementById('ctvEmail')?.value;

        if (!name || !phone) {
            showToast('Vui lòng điền họ tên và số điện thoại!', false);
            return;
        }

        const result = await registerCTV(name, phone, email);
        if (result?.ok) {
            if (result.existing) {
                showToast(
                    `Chào mừng trở lại! Mã CTV: <strong>${escapeHTML(result.referral_code)}</strong>`
                    + `<br><a href="/chia-se.html" style="color:var(--gold-light);font-weight:600">Viết bài chia sẻ</a>`
                    + ` &nbsp;|&nbsp; <a href="/ctv-dashboard.html" style="color:var(--gold-light);font-weight:600">Dashboard CTV</a>`,
                    true,
                    { html: true, duration: 8000 }
                );
            } else {
                showToast(
                    `Đăng ký thành công! Mã CTV: <strong>${escapeHTML(result.referral_code)}</strong>`
                    + `<br><br><span style="font-size:14px">Mật khẩu Dashboard mặc định là <strong>Số điện thoại</strong> của bạn. Vui lòng đăng nhập và đổi mật khẩu sớm.</span>`
                    + `<br><a href="/chia-se.html" style="color:var(--gold-light);font-weight:600">Viết bài chia sẻ (+3đ)</a>`
                    + ` &nbsp;|&nbsp; <a href="/ctv-dashboard.html" style="color:var(--gold-light);font-weight:600">Dashboard CTV</a>`,
                    true,
                    { html: true, duration: 8000 }
                );
            }
            form.reset();
            setTimeout(() => window.location.reload(), 8000);
        } else {
            showToast('Đăng ký thất bại. Vui lòng thử lại!', false);
        }
    });
}
