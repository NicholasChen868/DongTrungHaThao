// ===================================
// ADMIN UTILS — Shared helpers
// Toast, CSV export, generic table renderer
// ===================================
import { escapeHTML } from '../utils/sanitize.js';

/**
 * Hiển thị toast notification
 */
export function showAdminToast(msg, type = 'success') {
    const toast = document.getElementById('adminToast');
    toast.textContent = msg;
    toast.className = `admin-toast ${type} show`;
    setTimeout(() => toast.classList.remove('show'), 3000);
}

/**
 * Xuất dữ liệu CSV
 */
export async function exportCSV(type, { supabase, getSessionToken }) {
    try {
        let data, filename, headers;
        if (type === 'orders') {
            const res = await supabase.rpc('admin_list_orders', { p_session_token: getSessionToken() });
            data = res.data;
            filename = 'don-hang';
            headers = ['ID', 'Khách hàng', 'SĐT', 'Địa chỉ', 'SL', 'Đơn giá', 'Giảm %', 'Tổng', 'CTV', 'Ghi chú', 'Trạng thái', 'Ngày tạo'];
        } else if (type === 'ctv') {
            const res = await supabase.rpc('admin_list_ctv', { p_session_token: getSessionToken() });
            data = res.data;
            filename = 'ctv';
            headers = ['Mã CTV', 'Tên', 'SĐT', 'Email', 'Hạng', 'Điểm', 'VNĐ', 'Ngày ĐK'];
        }
        if (!data?.length) {
            showAdminToast('Không có dữ liệu để xuất', 'error');
            return;
        }

        const fieldMap = {
            orders: ['id', 'customer_name', 'phone', 'address', 'quantity', 'unit_price', 'discount_percent', 'total_amount', 'ctv_code', 'note', 'status', 'created_at'],
            ctv: ['referral_code', 'name', 'phone', 'email', 'tier', 'total_points', 'available_vnd', 'created_at'],
        };

        const fields = fieldMap[type];
        const csvRows = [headers.join(',')];
        data.forEach(row => {
            csvRows.push(fields.map(f => {
                let v = row[f] ?? '';
                v = String(v).replace(/"/g, '""');
                if (v.includes(',') || v.includes('"') || v.includes('\n')) v = `"${v}"`;
                return v;
            }).join(','));
        });

        const blob = new Blob(['\uFEFF' + csvRows.join('\n')], { type: 'text/csv;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${filename}_${new Date().toISOString().slice(0, 10)}.csv`;
        a.click();
        URL.revokeObjectURL(url);
        showAdminToast(`Đã xuất ${data.length} dòng → ${a.download}`);
    } catch (err) {
        showAdminToast('Lỗi xuất CSV: ' + err.message, 'error');
    }
}

/**
 * Render bảng dữ liệu generic
 */
export function renderTable(containerId, data, fields, headers) {
    const container = document.getElementById(containerId);
    if (!data?.length) {
        container.innerHTML = '<div class="admin-empty">Chưa có dữ liệu</div>';
        return;
    }

    container.innerHTML = `
<table class="admin-table">
    <thead><tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr></thead>
    <tbody>
        ${data.map(row => `<tr>${fields.map(f => {
        let val = row[f];
        if (f === 'created_at' && val) {
            val = new Date(val).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' });
        }
        if (f === 'total_amount' && val) val = Number(val).toLocaleString('vi-VN') + '₫';
        if (f === 'available_vnd' && val) val = Number(val).toLocaleString('vi-VN') + '₫';
        if (f === 'status') {
            const cls = val === 'completed' ? 'badge-success' : val === 'pending' ? 'badge-warning' : val === 'cancelled' ? 'badge-danger' : 'badge-info';
            val = `<span class="badge ${cls}">${escapeHTML(val) || '—'}</span>`;
            return `<td>${val}</td>`;
        }
        if (f === 'tier') {
            const map = { silver: '🥈 Bạc', gold: '🥇 Vàng', diamond: '💎 Kim Cương' };
            val = map[val] || escapeHTML(val) || '—';
            return `<td>${val}</td>`;
        }
        if (f === 'rating') { val = '⭐'.repeat(parseInt(val) || 0); return `<td>${val}</td>`; }
        if (f === 'quote' || f === 'message' || f === 'address') {
            val = String(val || '').substring(0, 60) + (String(val || '').length > 60 ? '...' : '');
        }
        return `<td>${escapeHTML(val) ?? '—'}</td>`;
    }).join('')}</tr>`).join('')}
    </tbody>
</table>
`;
}
