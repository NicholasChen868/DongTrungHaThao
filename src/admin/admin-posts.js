// ===================================
// ADMIN POSTS — Bài viết, testimonials, contacts, withdrawals
// ===================================
import { escapeHTML } from '../utils/sanitize.js';
import { apiCall, handleApiError } from '../utils/api.js';

/**
 * Tải danh sách bài viết
 */
export async function loadPosts({ supabase, getSessionToken, showAdminToast }) {
    try {
        const { data, error } = await apiCall(
            () => supabase.rpc('admin_list_posts', { p_session_token: getSessionToken() }),
            { retries: 2, context: 'Tải bài viết' }
        );
        if (error) throw error;

        const container = document.getElementById('allPosts');
        if (!data?.length) {
            container.innerHTML = '<div class="admin-empty">Chưa có bài viết</div>';
            return;
        }

        const fmtDate = (d) => new Date(d).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
        const catMap = { 'suc-khoe': '💚 Sức khỏe', 'cuoc-song': '🏡 Cuộc sống', 'trai-nghiem': '🌿 Trải nghiệm', 'meo-hay': '💡 Mẹo hay' };

        container.innerHTML = `<table class="admin-table">
    <thead><tr><th>ID</th><th>Tác giả</th><th>Tiêu đề</th><th>Chuyên mục</th><th>👁️</th><th>❤️</th><th>Nhuận bút</th><th>Trạng thái</th><th>Ngày</th><th>Thao tác</th></tr></thead>
    <tbody>
        ${data.map(p => {
            const status = p.is_approved
                ? '<span class="badge badge-success">✓ Đã duyệt</span>'
                : '<span class="badge badge-warning">⏳ Chờ duyệt</span>';
            const reward = p.reward_points_granted
                ? '<span class="badge badge-success">✓ 30K</span>'
                : '<span style="color:var(--text-muted)">—</span>';
            const actions = !p.is_approved
                ? `<button class="btn-action btn-approve" data-id="${parseInt(p.id)}" onclick="approvePostReward(+this.dataset.id)">✓ Duyệt</button><button class="btn-action btn-reject" data-id="${parseInt(p.id)}" onclick="rejectPost(+this.dataset.id)">✗ Xóa</button>`
                : `<button class="btn-action btn-reject" data-id="${parseInt(p.id)}" onclick="rejectPost(+this.dataset.id)">Ẩn</button>`;
            return `<tr>
        <td>#${parseInt(p.id)}</td>
        <td>${escapeHTML(p.member_name)}</td>
        <td>${escapeHTML((p.title || '').substring(0, 40))}</td>
        <td>${catMap[p.category] || escapeHTML(p.category)}</td>
        <td>${parseInt(p.views) || 0}</td>
        <td>${parseInt(p.likes) || 0}</td>
        <td>${reward}</td>
        <td>${status}</td>
        <td>${fmtDate(p.created_at)}</td>
        <td>${actions}</td>
    </tr>`;
        }).join('')}
    </tbody>
</table>`;
    } catch (err) {
        handleApiError(err, 'Tải bài viết', showAdminToast);
    }
}

/**
 * Duyệt bài viết + cộng nhuận bút
 */
export async function approvePostReward(id, { supabase, getSessionToken, showAdminToast, loaded, loadPosts: reloadPosts }) {
    if (!confirm(`Duyệt bài #${id} và cộng nhuận bút 30,000đ?`)) return;
    try {
        const { data, error } = await supabase.rpc('approve_post_and_reward', {
            p_session_token: getSessionToken(), p_post_id: id
        });
        if (error) throw error;
        if (data?.points_credited) {
            showAdminToast(`Bài #${id} đã duyệt + Cộng 30,000đ nhuận bút`);
        } else if (data?.message) {
            showAdminToast(data.message);
        } else {
            showAdminToast(`Bài #${id} đã duyệt (BTV chưa có tài khoản CTV)`);
        }
        loaded.posts = false;
        await reloadPosts();
    } catch (err) {
        showAdminToast('Lỗi: ' + err.message, 'error');
    }
}

/**
 * Ẩn/xóa bài viết
 */
export async function rejectPost(id, { supabase, getSessionToken, showAdminToast, loaded, loadPosts: reloadPosts }) {
    if (!confirm(`Xác nhận ẩn bài #${id}?`)) return;
    try {
        const { error } = await supabase.rpc('admin_update_post_status', {
            p_session_token: getSessionToken(), p_post_id: id, p_approve: false
        });
        if (error) throw error;
        showAdminToast(`Bài #${id} → ẩn`);
        loaded.posts = false;
        await reloadPosts();
    } catch (err) {
        showAdminToast('Lỗi: ' + err.message, 'error');
    }
}

/**
 * Tải testimonials
 */
export async function loadTestimonials({ supabase, renderTable }) {
    const { data } = await supabase.from('company_testimonials')
        .select('*').order('created_at', { ascending: false }).limit(50);
    renderTable('allTestimonials', data, ['id', 'author_name', 'location', 'rating', 'quote', 'created_at'],
        ['ID', 'Tên', 'Địa điểm', 'Sao', 'Nội dung', 'Ngày tạo']);
}

/**
 * Tải contacts
 */
export async function loadContacts({ supabase, renderTable }) {
    const { data } = await supabase.from('contact_submissions')
        .select('*').order('created_at', { ascending: false }).limit(50);
    renderTable('allContacts', data, ['id', 'name', 'phone', 'email', 'message', 'created_at'],
        ['ID', 'Tên', 'SĐT', 'Email', 'Nội dung', 'Ngày gửi']);
}

/**
 * Tải yêu cầu rút tiền (admin)
 */
export async function loadAdminWithdrawals({ supabase, getSessionToken, showAdminToast }) {
    try {
        const { data } = await apiCall(
            () => supabase.rpc('admin_list_withdrawals', { p_session_token: getSessionToken() }),
            { retries: 2, context: 'Tải yêu cầu rút tiền' }
        );

        const container = document.getElementById('allWithdrawals');
        if (!data?.length) {
            container.innerHTML = '<div class="admin-empty">Chưa có yêu cầu rút tiền</div>';
            return;
        }

        const fmtDate = (d) => new Date(d).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
        const fmtMoney = (v) => Number(v).toLocaleString('vi-VN') + '₫';
        const statusMap = {
            pending: '<span class="badge badge-warning">⏳ Chờ</span>',
            approved: '<span class="badge badge-info">✅ Duyệt</span>',
            paid: '<span class="badge badge-success">💰 Đã trả</span>',
            rejected: '<span class="badge badge-danger">✗ Từ chối</span>',
        };

        container.innerHTML = `<table class="admin-table">
    <thead><tr><th>ID</th><th>CTV</th><th>Số tiền</th><th>Ngân hàng</th><th>STK</th><th>Chủ TK</th><th>Trạng thái</th><th>Ngày</th><th>Thao tác</th></tr></thead>
    <tbody>
        ${data.map(w => {
            const status = statusMap[w.status] || statusMap.pending;
            let actions = '';
            if (w.status === 'pending') {
                actions = `<button class="btn-action btn-approve" onclick="processWithdrawal(${w.id},'approved')">Duyệt</button>
   <button class="btn-action btn-reject" onclick="processWithdrawal(${w.id},'rejected')">✗</button>`;
            } else if (w.status === 'approved') {
                actions = `<button class="btn-action btn-approve" onclick="processWithdrawal(${w.id},'paid')">💰 Đã trả</button>`;
            }
            return `<tr>
        <td>#${parseInt(w.id)}</td>
        <td>${escapeHTML(w.ctv_name)}<br><small style="color:var(--text-muted)">${escapeHTML(w.ctv_code)}</small></td>
        <td style="color:var(--gold-light);font-weight:600">${fmtMoney(w.amount)}</td>
        <td>${escapeHTML(w.bank_name)}</td>
        <td>${escapeHTML(w.bank_account)}</td>
        <td>${escapeHTML(w.bank_holder)}</td>
        <td>${status}</td>
        <td>${fmtDate(w.created_at)}</td>
        <td>${actions}</td>
    </tr>`;
        }).join('')}
    </tbody>
</table>`;
    } catch (err) {
        handleApiError(err, 'Tải yêu cầu rút tiền', showAdminToast);
    }
}

/**
 * Xử lý yêu cầu rút tiền
 */
export async function processWithdrawal(id, newStatus, { supabase, getSessionToken, showAdminToast, loaded, loadAdminWithdrawals: reload }) {
    const label = { approved: 'duyệt', rejected: 'từ chối', paid: 'xác nhận đã thanh toán' };
    if (!confirm(`Xác nhận ${label[newStatus]} yêu cầu #${id}?`)) return;
    try {
        const { error } = await supabase.rpc('admin_process_withdrawal', {
            p_session_token: getSessionToken(), p_withdrawal_id: id, p_status: newStatus
        });
        if (error) throw error;
        showAdminToast(`Yêu cầu #${id} → ${label[newStatus]}`);
        loaded.withdrawals = false;
        await reload();
    } catch (err) {
        showAdminToast('Lỗi: ' + err.message, 'error');
    }
}
