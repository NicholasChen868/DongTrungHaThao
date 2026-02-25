// ===================================
// ADMIN ORDERS — Quản lý đơn hàng
// Load, render, update order status
// ===================================
import { escapeHTML } from '../utils/sanitize.js';
import { apiCall, handleApiError } from '../utils/api.js';

/**
 * Tải danh sách đơn hàng
 */
export async function loadOrders({ supabase, getSessionToken, showAdminToast, renderOrderTable }) {
    try {
        const { data, error } = await apiCall(
            () => supabase.rpc('admin_list_orders', { p_session_token: getSessionToken() }),
            { retries: 2, context: 'Tải đơn hàng' }
        );
        if (error) throw error;
        renderOrderTable('allOrders', data || [], false);
    } catch (err) {
        handleApiError(err, 'Tải đơn hàng', showAdminToast);
    }
}

/**
 * Render bảng đơn hàng (table + card mobile view)
 */
export function renderOrderTable(containerId, data, compact) {
    const container = document.getElementById(containerId);
    if (!data?.length) {
        container.innerHTML = '<div class="admin-empty">Chưa có đơn hàng</div>';
        return;
    }

    const fmtDate = (d) => new Date(d).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
    const fmtMoney = (v) => Number(v || 0).toLocaleString('vi-VN') + '₫';
    const statusBadge = (s) => {
        const map = {
            pending: ['⏳ Chờ duyệt', 'badge-warning'],
            confirmed: ['✅ Đã duyệt', 'badge-info'],
            shipping: ['🚚 Đang giao', 'badge-info'],
            completed: ['✓ Hoàn thành', 'badge-success'],
            cancelled: ['✗ Đã hủy', 'badge-danger'],
        };
        const [text, cls] = map[s] || ['—', 'badge-info'];
        return `<span class="badge ${cls}">${text}</span>`;
    };

    function getActions(o) {
        const oid = parseInt(o.id);
        if (o.status === 'pending') return `<button class="btn-action btn-approve" onclick="updateOrder(${oid},'confirmed')">✓ Duyệt</button><button class="btn-action btn-reject" onclick="updateOrder(${oid},'cancelled')">✗ Hủy</button>`;
        if (o.status === 'confirmed') return `<button class="btn-action btn-ship" onclick="updateOrder(${oid},'shipping')">🚚 Giao</button>`;
        if (o.status === 'shipping') return `<button class="btn-action btn-approve" onclick="updateOrder(${oid},'completed')">✓ Xong</button>`;
        return '—';
    }

    const headers = compact
        ? '<th>ID</th><th>Khách hàng</th><th>Tổng</th><th>Trạng thái</th><th>Thao tác</th>'
        : '<th>ID</th><th>Khách hàng</th><th>SĐT</th><th>Địa chỉ</th><th>SL</th><th>Tổng</th><th>CTV</th><th>Trạng thái</th><th>Ngày</th><th>Thao tác</th>';

    const tableHTML = `
<div class="order-table-wrapper">
<table class="admin-table">
    <thead><tr>${headers}</tr></thead>
    <tbody>
        ${data.map(o => {
        const actions = getActions(o);
        if (compact) {
            return `<tr>
<td>#${parseInt(o.id)}</td>
<td>${escapeHTML(o.customer_name)}</td>
<td>${fmtMoney(o.total_amount)}</td>
<td>${statusBadge(o.status)}</td>
<td>${actions}</td>
        </tr>`;
        }
        return `<tr>
        <td>#${parseInt(o.id)}</td>
        <td>${escapeHTML(o.customer_name)}</td>
        <td>${escapeHTML(o.phone)}</td>
        <td>${escapeHTML(String(o.address || '').substring(0, 40))}${(o.address || '').length > 40 ? '...' : ''}</td>
        <td>${parseInt(o.quantity) || 1}</td>
        <td>${fmtMoney(o.total_amount)}</td>
        <td>${escapeHTML(o.ctv_code) || '—'}</td>
        <td>${statusBadge(o.status)}</td>
        <td>${fmtDate(o.created_at)}</td>
        <td>${actions}</td>
    </tr>`;
    }).join('')}
    </tbody>
</table>
</div>`;

    const cardsHTML = `
<div class="order-cards">
<div class="order-cards-grid">
${data.map(o => {
        const oid = parseInt(o.id);
        const actions = getActions(o);
        const actionsHTML = actions !== '—'
            ? `<div class="order-card-footer">${actions}</div>`
            : '';
        return `
<div class="order-card status-${o.status}">
    <div class="order-card-header">
        <span class="order-card-id">#${oid}</span>
        ${statusBadge(o.status)}
    </div>
    <div class="order-card-name">${escapeHTML(o.customer_name)}</div>
    <div class="order-card-info">
        <div class="order-card-row">
<span class="label">Tổng tiền</span>
<span class="order-card-amount">${fmtMoney(o.total_amount)}</span>
        </div>
        ${!compact ? `<div class="order-card-row">
<span class="label">SL</span>
<span class="value">${parseInt(o.quantity) || 1} hộp</span>
        </div>` : ''}
        ${!compact && o.ctv_code ? `<div class="order-card-row">
<span class="label">CTV</span>
<span class="value">${escapeHTML(o.ctv_code)}</span>
        </div>` : ''}
    </div>
    <div class="order-card-date">${fmtDate(o.created_at)}</div>
    ${actionsHTML}
</div>`;
    }).join('')}
</div>
</div>`;

    container.innerHTML = tableHTML + cardsHTML;
}

/**
 * Cập nhật trạng thái đơn hàng
 */
export async function updateOrder(id, newStatus, { supabase, getSessionToken, showAdminToast, loaded, loadOrders: reloadOrders, loadOverview }) {
    const labels = { confirmed: 'duyệt', shipping: 'giao hàng', completed: 'hoàn thành', cancelled: 'hủy' };
    if (!confirm(`Xác nhận ${labels[newStatus]} đơn #${id}?`)) return;

    try {
        const { error } = await supabase.rpc('admin_update_order_status', {
            p_session_token: getSessionToken(), p_order_id: id, p_status: newStatus
        });
        if (error) throw error;
        showAdminToast(`Đơn #${id} → ${labels[newStatus]}`);
        loaded.orders = false;
        loaded.overview = false;
        await reloadOrders();
        await loadOverview();
    } catch (err) {
        showAdminToast('Lỗi cập nhật: ' + err.message, 'error');
    }
}
