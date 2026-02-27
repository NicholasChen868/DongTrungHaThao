// ===================================
// ADMIN — Partnership Inquiries
// Load, display, update status of partnership inquiries
// ===================================
import { escapeHTML } from '../utils/sanitize.js';

const STATUS_MAP = {
    pending: { label: 'Chờ xử lý', cls: 'badge-warning' },
    contacted: { label: 'Đã liên hệ', cls: 'badge-info' },
    approved: { label: 'Đã duyệt', cls: 'badge-success' },
    rejected: { label: 'Từ chối', cls: 'badge-danger' },
};

const TYPE_MAP = {
    dealer: '🏪 Đại Lý',
    distributor: '🏭 Nhà Phân Phối',
    investor: '💰 Đầu Tư',
    other: '📋 Khác',
};

/**
 * Load partnership inquiries into the admin panel
 */
export async function loadPartnerships({ supabase, showAdminToast }) {
    const container = document.getElementById('allPartnerships');
    if (!container) return;

    try {
        const { data, error } = await supabase.rpc('get_partnership_inquiries');
        if (error) throw error;

        const result = typeof data === 'string' ? JSON.parse(data) : data;
        if (!result?.ok) throw new Error(result?.error || 'Unknown error');

        const items = result.items || [];
        const total = result.total || 0;

        // Update stats
        const statsEl = document.getElementById('partnershipStats');
        if (statsEl) {
            const pending = items.filter(i => i.status === 'pending').length;
            statsEl.innerHTML = `
                <span>📊 Tổng: <strong>${total}</strong></span>
                <span style="margin-left:16px">⏳ Chờ xử lý: <strong style="color:#fbbf24">${pending}</strong></span>
            `;
        }

        if (!items.length) {
            container.innerHTML = '<div class="admin-empty">Chưa có yêu cầu hợp tác nào</div>';
            return;
        }

        container.innerHTML = `
<table class="admin-table">
    <thead><tr>
        <th>Ngày</th>
        <th>Họ Tên</th>
        <th>SĐT</th>
        <th>Email</th>
        <th>Loại</th>
        <th>Khu Vực</th>
        <th>Ghi Chú</th>
        <th>Trạng Thái</th>
        <th>Hành Động</th>
    </tr></thead>
    <tbody>
        ${items.map(p => {
            const date = new Date(p.created_at).toLocaleDateString('vi-VN', {
                day: '2-digit', month: '2-digit', year: '2-digit',
                hour: '2-digit', minute: '2-digit'
            });
            const st = STATUS_MAP[p.status] || STATUS_MAP.pending;
            const typeLabel = TYPE_MAP[p.type] || TYPE_MAP.other;
            const noteShort = (p.note || '').length > 50
                ? p.note.substring(0, 50) + '…'
                : (p.note || '—');

            return `<tr>
                <td>${date}</td>
                <td><strong>${escapeHTML(p.name)}</strong></td>
                <td><a href="tel:${escapeHTML(p.phone)}" style="color:var(--gold)">${escapeHTML(p.phone)}</a></td>
                <td>${escapeHTML(p.email || '—')}</td>
                <td>${typeLabel}</td>
                <td>${escapeHTML(p.location || '—')}</td>
                <td title="${escapeHTML(p.note || '')}">${escapeHTML(noteShort)}</td>
                <td><span class="badge ${st.cls}">${st.label}</span></td>
                <td>
                    <select onchange="updatePartnership('${p.id}', this.value)" class="status-select">
                        ${Object.entries(STATUS_MAP).map(([k, v]) =>
                `<option value="${k}" ${k === p.status ? 'selected' : ''}>${v.label}</option>`
            ).join('')}
                    </select>
                </td>
            </tr>`;
        }).join('')}
    </tbody>
</table>`;

    } catch (err) {
        container.innerHTML = `<div class="admin-empty" style="color:var(--error)">Lỗi tải dữ liệu: ${escapeHTML(err.message)}</div>`;
        showAdminToast('Lỗi tải partnership inquiries: ' + err.message, 'error');
    }
}

/**
 * Update partnership inquiry status
 */
export async function updatePartnershipStatus(id, newStatus, { supabase, showAdminToast, loaded, loadPartnerships: reload }) {
    try {
        const { data, error } = await supabase.rpc('update_partnership_status', {
            p_inquiry_id: id,
            p_new_status: newStatus,
        });
        if (error) throw error;

        const result = typeof data === 'string' ? JSON.parse(data) : data;
        if (!result?.ok) throw new Error(result?.error || 'Update failed');

        showAdminToast(`✅ Đã cập nhật trạng thái → ${STATUS_MAP[newStatus]?.label || newStatus}`);
        // Reload section
        loaded.partnerships = false;
        await reload();
    } catch (err) {
        showAdminToast('Lỗi cập nhật: ' + err.message, 'error');
    }
}
