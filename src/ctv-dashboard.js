import './ctv-dashboard.css';
import { supabase } from './supabase.js';
import { escapeHTML } from './utils/sanitize.js';
import { checkRateLimit, recordAttempt, createSubmitGuard } from './utils/ratelimit.js';
import { handleCTVRegister } from './ctv.js';

const loginScreen = document.getElementById('ctvLoginScreen');
const dashboardPage = document.getElementById('ctvDashboardPage');
const loginForm = document.getElementById('loginForm');
const loginError = document.getElementById('loginError');
const registerForm = document.getElementById('registerForm');
const registerError = document.getElementById('registerError');
const registerGuard = createSubmitGuard(10000);

// --- SHA-256 utility ---
async function sha256(str) {
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str));
    return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

// --- Tab switching ---
function showPanel(panelId) {
    document.querySelectorAll('.ctv-auth-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.ctv-auth-panel').forEach(p => p.classList.remove('active'));
    document.getElementById(panelId).classList.add('active');
    // Highlight correct tab
    document.querySelectorAll('.ctv-auth-tab').forEach(t => {
        if ((panelId === 'panelLogin' && t.dataset.tab === 'login') ||
            (panelId === 'panelRegister' && t.dataset.tab === 'register')) {
            t.classList.add('active');
        }
    });
    // Hide tabs in forgot mode
    const tabContainer = document.querySelector('.ctv-auth-tabs');
    if (tabContainer) tabContainer.style.display = panelId === 'panelForgot' ? 'none' : '';
    loginError.style.display = 'none';
    registerError.style.display = 'none';
}

document.querySelectorAll('.ctv-auth-tab').forEach(tab => {
    tab.addEventListener('click', () => {
        showPanel(tab.dataset.tab === 'login' ? 'panelLogin' : 'panelRegister');
    });
});

// Forgot password link
document.getElementById('ctvForgotLink').addEventListener('click', (e) => {
    e.preventDefault();
    showPanel('panelForgot');
});

// Back to login
document.getElementById('ctvBackToLogin').addEventListener('click', (e) => {
    e.preventDefault();
    showPanel('panelLogin');
});

// Check if already logged in
const savedRef = localStorage.getItem('ctv_ref_code');
if (savedRef) {
    loadDashboard(savedRef);
}

// Login form (with password)
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    loginError.style.display = 'none';
    const phone = document.getElementById('loginPhone').value.trim();
    const password = document.getElementById('loginPassword').value;
    if (!phone || !password) return;

    const rl = checkRateLimit('ctv_login', 5, 60000);
    if (!rl.allowed) {
        loginError.textContent = `Quá nhiều lần thử. Đợi ${Math.ceil(rl.remainingMs / 1000)}s`;
        loginError.style.display = 'block';
        return;
    }
    recordAttempt('ctv_login', 60000);

    try {
        const pwHash = await sha256(password);
        let loggedIn = false;

        // 1) Try unified auth (members table) first
        const { data: userData, error: userError } = await supabase.rpc('authenticate_user', {
            p_phone: phone,
            p_password_hash: pwHash
        });

        if (!userError && userData?.ok) {
            // Store unified session
            localStorage.setItem('maldala_user', JSON.stringify(userData));
            localStorage.setItem('maldala_session_expiry', String(Date.now() + 86400000));

            // Handle by role
            if (userData.role === 'admin') {
                window.location.href = '/';
                return;
            }
            if (userData.referral_code) {
                localStorage.setItem('ctv_ref_code', userData.referral_code);
                loadDashboard(userData.referral_code);
                loggedIn = true;
            } else if (userData.role === 'member' || userData.role === 'loyal_customer') {
                window.location.href = '/';
                return;
            }
        }

        // 2) Fallback: try CTV-specific auth (ctv_accounts table)
        if (!loggedIn) {
            const { data: ctvData, error: ctvError } = await supabase.rpc('authenticate_ctv', {
                p_phone: phone,
                p_password_hash: pwHash
            });

            if (!ctvError && ctvData?.ok && ctvData.referral_code) {
                localStorage.setItem('ctv_ref_code', ctvData.referral_code);
                loadDashboard(ctvData.referral_code);
                loggedIn = true;
            }
        }

        if (!loggedIn) {
            loginError.textContent = 'Sai số điện thoại hoặc mật khẩu';
            loginError.style.display = 'block';
        }
    } catch (err) {
        loginError.textContent = 'Lỗi kết nối. Vui lòng thử lại.';
        loginError.style.display = 'block';
    }
});

// Forgot password form
document.getElementById('ctvForgotForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const phone = document.getElementById('ctvResetPhone').value.trim();
    const email = document.getElementById('ctvResetEmail').value.trim();
    const newPw = document.getElementById('ctvResetNewPw').value;
    const confirmPw = document.getElementById('ctvResetConfirmPw').value;
    const errEl = document.getElementById('ctvForgotError');
    const btn = e.target.querySelector('button[type="submit"]');

    errEl.style.display = 'none';

    if (!phone || !email || !newPw || !confirmPw) {
        errEl.textContent = 'Vui lòng điền đầy đủ thông tin';
        errEl.style.display = 'block'; return;
    }
    if (newPw.length < 6) {
        errEl.textContent = 'Mật khẩu mới phải có ít nhất 6 ký tự';
        errEl.style.display = 'block'; return;
    }
    if (newPw !== confirmPw) {
        errEl.textContent = 'Mật khẩu xác nhận không khớp';
        errEl.style.display = 'block'; return;
    }

    btn.disabled = true;
    btn.textContent = 'Đang xử lý...';

    try {
        const pwHash = await sha256(newPw);
        const { data, error } = await supabase.rpc('reset_ctv_password', {
            p_phone: phone,
            p_email: email,
            p_new_password_hash: pwHash
        });

        if (error) throw error;
        if (!data || !data.ok) {
            const errMsg = data?.error || '';
            if (errMsg.toLowerCase().includes('phone') || errMsg.toLowerCase().includes('sdt')) {
                errEl.textContent = 'Số điện thoại này chưa đăng ký tài khoản Đại Lý. Vui lòng kiểm tra lại.';
            } else if (errMsg.toLowerCase().includes('email')) {
                errEl.textContent = 'Email không khớp với số điện thoại đã đăng ký.';
            } else {
                errEl.textContent = 'Không thể đặt lại mật khẩu. Vui lòng kiểm tra SĐT và Email đã đăng ký.';
            }
            errEl.style.display = 'block'; return;
        }

        alert(`Mật khẩu của ${data.name} đã được đặt lại thành công! Bấm OK để đăng nhập.`);
        document.getElementById('ctvForgotForm').reset();
        showPanel('panelLogin');
    } catch (err) {
        errEl.textContent = 'Lỗi: ' + (err.message || 'Thử lại sau');
        errEl.style.display = 'block';
    } finally {
        btn.disabled = false;
        btn.textContent = 'Đặt Lại Mật Khẩu';
    }
});

// Register form
registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    registerError.style.display = 'none';

    const name = document.getElementById('regName').value.trim();
    const phone = document.getElementById('regPhone').value.trim();
    const email = document.getElementById('regEmail').value.trim();
    const password = document.getElementById('regPassword').value;
    const referrerCode = document.getElementById('regReferrer').value.trim();

    // Validate phone
    if (!/^0\d{9}$/.test(phone)) {
        registerError.textContent = 'Số điện thoại phải gồm 10 chữ số, bắt đầu bằng 0';
        registerError.style.display = 'block';
        return;
    }

    // Validate password
    if (password.length < 6) {
        registerError.textContent = 'Mật khẩu phải có ít nhất 6 ký tự';
        registerError.style.display = 'block';
        return;
    }

    // Rate limit
    const guard = registerGuard();
    if (!guard.allowed) {
        registerError.textContent = `Vui lòng đợi ${Math.ceil(guard.remainingMs / 1000)}s trước khi thử lại`;
        registerError.style.display = 'block';
        return;
    }

    const btn = registerForm.querySelector('button[type="submit"]');
    btn.disabled = true;
    btn.textContent = 'Đang tạo tài khoản...';

    try {
        // Hash password
        const passwordHash = await sha256(password);

        const result = await handleCTVRegister({
            name, phone, email, passwordHash, referrerCode
        });

        if (result?.ok) {
            showCtvToast(`Đăng ký thành công! Mã Đại Lý: ${result.referral_code} — Bắt đầu chia sẻ tại /chia-se.html`);
            registerForm.reset();
            localStorage.setItem('ctv_ref_code', result.referral_code);
            setTimeout(() => loadDashboard(result.referral_code), 2000);
        } else {
            registerError.textContent = result?.error || 'Đăng ký thất bại. Vui lòng thử lại.';
            registerError.style.display = 'block';
        }
    } catch (err) {
        registerError.textContent = 'Lỗi kết nối. Vui lòng thử lại.';
        registerError.style.display = 'block';
    } finally {
        btn.disabled = false;
        btn.textContent = 'Tạo Tài Khoản Đại Lý';
    }
});

// Logout
document.getElementById('logoutBtn').addEventListener('click', () => {
    localStorage.removeItem('ctv_ref_code');
    window.location.reload();
});

// Copy ref link
document.getElementById('refCopyBtn').addEventListener('click', async () => {
    const input = document.getElementById('refLinkInput');
    await navigator.clipboard.writeText(input.value);
    const btn = document.getElementById('refCopyBtn');
    btn.textContent = 'Đã copy!';
    setTimeout(() => btn.textContent = 'Copy Link', 2000);
});

async function loadDashboard(refCode) {
    loginScreen.style.display = 'none';
    dashboardPage.style.display = 'block';

    try {
        // Get dashboard data
        const { data, error } = await supabase.rpc('get_ctv_dashboard', {
            p_ref_code: refCode,
        });

        if (error || !data?.ok) {
            loginScreen.style.display = 'block';
            dashboardPage.style.display = 'none';
            loginError.textContent = 'Mã Đại Lý không hợp lệ. Vui lòng đăng nhập lại.';
            loginError.style.display = 'block';
            localStorage.removeItem('ctv_ref_code');
            return;
        }

        // Populate stats
        document.getElementById('dashWelcome').textContent = `Xin chào, ${data.name}!`;

        const tierEl = document.getElementById('dashTier');
        const tierMap = {
            silver: ['Bạc', 'tier-silver'],
            gold: ['Vàng', 'tier-gold'],
            diamond: ['Kim Cương', 'tier-diamond'],
        };
        const [tierText, tierClass] = tierMap[data.tier] || ['🥈 Bạc', 'tier-silver'];
        tierEl.textContent = tierText;
        tierEl.className = `ctv-welcome-tier ${tierClass}`;

        document.getElementById('statPoints').textContent = data.total_points || 0;
        document.getElementById('statPending').textContent = data.pending_points || 0;
        document.getElementById('statVND').textContent = `${(data.available_vnd || 0).toLocaleString('vi-VN')}₫`;
        document.getElementById('statClicks').textContent = data.total_clicks || 0;
        document.getElementById('statToday').textContent = `${data.today_points || 0}/50 điểm`;

        // Share Center
        initShareCenter(data.referral_code);

        // Load recent transactions + withdrawals + BTV posts + banking
        loadTransactions(refCode);
        loadWithdrawals(data.referral_code, data.name);
        loadBtvPosts(refCode);
        loadNotifications(refCode);
        loadBankingInfo(refCode);

        // Store for withdrawal form
        window._ctvData = data;

        // Onboarding wizard logic
        initOnboarding(data);

    } catch (err) {
        console.error('Dashboard load error:', err);
    }
}

async function loadTransactions(refCode) {
    const container = document.getElementById('transactionsBody');

    try {
        // Get the Đại Lý account ID first
        const { data: acct } = await supabase
            .from('ctv_accounts')
            .select('id')
            .eq('referral_code', refCode)
            .single();

        if (!acct) {
            container.innerHTML = '<div class="ctv-empty">Chưa có giao dịch nào</div>';
            return;
        }

        // Get recent point transactions
        const { data: transactions, error } = await supabase
            .from('point_transactions')
            .select('*')
            .eq('ctv_id', acct.id)
            .order('created_at', { ascending: false })
            .limit(20);

        if (error || !transactions?.length) {
            container.innerHTML = '<div class="ctv-empty">Chưa có giao dịch nào. Hãy chia sẻ link để nhận điểm!</div>';
            return;
        }

        const typeMap = {
            story: 'Câu chuyện',
            product: 'Sản phẩm',
            page: 'Trang chính',
        };

        container.innerHTML = `
  <table class="ctv-table">
    <thead>
      <tr>
        <th>Thời gian</th>
        <th>Loại</th>
        <th>Điểm</th>
        <th>Trạng thái</th>
      </tr>
    </thead>
    <tbody>
      ${transactions.map(t => {
            const date = new Date(t.created_at);
            const timeStr = date.toLocaleDateString('vi-VN', {
                day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit'
            });
            const typeStr = typeMap[t.content_type] || escapeHTML(t.content_type) || '—';
            const status = t.status === 'approved'
                ? '<span class="badge-approved">✓ Đã duyệt</span>'
                : '<span class="badge-pending">⏳ Đang chờ</span>';
            return `<tr>
          <td>${timeStr}</td>
          <td>${typeStr}</td>
          <td style="color:var(--gold-light);font-weight:600">+${t.points}</td>
          <td>${status}</td>
        </tr>`;
        }).join('')}
    </tbody>
  </table>
`;
    } catch (err) {
        container.innerHTML = '<div class="ctv-empty">Lỗi tải dữ liệu</div>';
        console.error('Transactions load error:', err);
    }
}

// --- BTV Posts ---
async function loadBtvPosts(refCode) {
    const container = document.getElementById('btvPostsBody');
    try {
        const { data, error } = await supabase.rpc('get_btv_posts', {
            p_ref_code: refCode
        });

        if (error) throw error;

        const posts = data?.posts || [];
        if (!posts.length) {
            container.innerHTML = '<div class="ctv-empty">Bạn chưa có bài viết nào. Viết bài để nhận 30,000đ nhuận bút khi được duyệt!</div>';
            return;
        }

        const catMap = {
            'suc-khoe': 'Sức khỏe',
            'cuoc-song': 'Cuộc sống',
            'trai-nghiem': 'Trải nghiệm',
            'meo-hay': 'Mẹo hay',
        };

        container.innerHTML = `
  <table class="ctv-table">
    <thead>
      <tr>
        <th>Tiêu đề</th>
        <th>Chuyên mục</th>
        <th>Ngày gửi</th>
        <th>Trạng thái</th>
        <th>Nhuận bút</th>
        <th>👁️</th>
        <th>❤️</th>
      </tr>
    </thead>
    <tbody>
      ${posts.map(p => {
            const date = new Date(p.created_at).toLocaleDateString('vi-VN', {
                day: '2-digit', month: '2-digit'
            });
            const status = p.is_approved
                ? '<span class="badge-approved">✓ Đã duyệt</span>'
                : '<span class="badge-pending">⏳ Chờ duyệt</span>';
            const reward = p.reward_points_granted
                ? '<span class="badge-approved">✓ 30K</span>'
                : '<span style="color:var(--text-muted)">—</span>';
            return `<tr>
          <td>${escapeHTML((p.title || '').substring(0, 30))}</td>
          <td>${catMap[p.category] || escapeHTML(p.category)}</td>
          <td>${date}</td>
          <td>${status}</td>
          <td>${reward}</td>
          <td>${parseInt(p.views) || 0}</td>
          <td>${parseInt(p.likes) || 0}</td>
        </tr>`;
        }).join('')}
    </tbody>
  </table>
`;
    } catch (err) {
        container.innerHTML = '<div class="ctv-empty">Lỗi tải bài viết</div>';
        console.error('BTV posts load error:', err);
    }
}

// --- Banking / Payment Info ---
let bankingData = null;

async function loadBankingInfo(refCode) {
    try {
        const { data, error } = await supabase.rpc('get_ctv_banking', { p_ref_code: refCode });
        if (error) throw error;
        bankingData = data;

        const statusEl = document.getElementById('bankStatus');
        const savedEl = document.getElementById('bankSavedDisplay');
        const formEl = document.getElementById('bankEditForm');
        const cancelBtn = document.getElementById('bankCancelBtn');

        if (data?.has_banking && data?.bank_name) {
            // Show saved info
            statusEl.className = 'bank-status configured';
            statusEl.innerHTML = '<span>✅</span> Đã thiết lập';
            document.getElementById('bankDisplayName').textContent = data.bank_name;
            document.getElementById('bankDisplayNumber').textContent = data.bank_account_number || '—';
            document.getElementById('bankDisplayHolder').textContent = data.bank_account_holder || '—';
            document.getElementById('bankDisplayBranch').textContent = data.bank_branch || '—';
            savedEl.style.display = 'block';
            formEl.style.display = 'none';

            // Auto-fill withdrawal form
            autoFillWithdrawalForm(data);
        } else {
            statusEl.className = 'bank-status not-configured';
            statusEl.innerHTML = '<span>⚠️</span> Chưa thiết lập — hãy nhập thông tin ngân hàng';
            savedEl.style.display = 'none';
            formEl.style.display = 'block';
            cancelBtn.style.display = 'none';
        }
    } catch (err) {
        console.error('Banking load error:', err);
    }
}

function autoFillWithdrawalForm(data) {
    if (!data) return;
    const wdBank = document.getElementById('wdBank');
    const wdAccount = document.getElementById('wdAccount');
    const wdHolder = document.getElementById('wdHolder');
    if (data.bank_name) {
        // Try to match bank name in withdrawal select
        for (let opt of wdBank.options) {
            if (opt.textContent === data.bank_name || opt.value === data.bank_name) {
                wdBank.value = opt.value || opt.textContent;
                break;
            }
        }
    }
    if (data.bank_account_number_full) wdAccount.value = data.bank_account_number_full;
    if (data.bank_account_holder) wdHolder.value = data.bank_account_holder;
}

// Edit button
document.getElementById('bankEditBtn')?.addEventListener('click', () => {
    document.getElementById('bankSavedDisplay').style.display = 'none';
    const formEl = document.getElementById('bankEditForm');
    formEl.style.display = 'block';
    document.getElementById('bankCancelBtn').style.display = 'inline-flex';

    // Pre-fill form with existing data
    if (bankingData) {
        const nameSelect = document.getElementById('bankName');
        for (let opt of nameSelect.options) {
            if (opt.textContent === bankingData.bank_name) { nameSelect.value = opt.value || opt.textContent; break; }
        }
        document.getElementById('bankAccountNumber').value = bankingData.bank_account_number_full || '';
        document.getElementById('bankAccountHolder').value = bankingData.bank_account_holder || '';
        document.getElementById('bankBranch').value = bankingData.bank_branch || '';
    }
});

// Cancel button
document.getElementById('bankCancelBtn')?.addEventListener('click', () => {
    if (bankingData?.has_banking) {
        document.getElementById('bankSavedDisplay').style.display = 'block';
        document.getElementById('bankEditForm').style.display = 'none';
    }
});

// Save button
document.getElementById('bankSaveBtn')?.addEventListener('click', async () => {
    const bankName = document.getElementById('bankName').value;
    const acctNum = document.getElementById('bankAccountNumber').value.trim();
    const acctHolder = document.getElementById('bankAccountHolder').value.trim();
    const branch = document.getElementById('bankBranch').value.trim();
    const errEl = document.getElementById('bankError');
    const successEl = document.getElementById('bankSuccess');
    const btn = document.getElementById('bankSaveBtn');

    errEl.style.display = 'none';
    successEl.style.display = 'none';

    if (!bankName || !acctNum || !acctHolder) {
        errEl.textContent = 'Vui lòng điền đầy đủ ngân hàng, số tài khoản và tên chủ TK';
        errEl.style.display = 'block';
        return;
    }
    if (!/^[0-9]{8,20}$/.test(acctNum)) {
        errEl.textContent = 'Số tài khoản phải từ 8-20 chữ số';
        errEl.style.display = 'block';
        return;
    }

    const refCode = localStorage.getItem('ctv_ref_code');
    if (!refCode) { errEl.textContent = 'Chưa đăng nhập'; errEl.style.display = 'block'; return; }

    btn.disabled = true;
    btn.textContent = 'Đang lưu...';

    try {
        const { data, error } = await supabase.rpc('update_ctv_banking', {
            p_ref_code: refCode,
            p_bank_name: bankName,
            p_account_number: acctNum,
            p_account_holder: acctHolder.toUpperCase(),
            p_branch: branch || null
        });
        if (error) throw error;
        if (!data?.ok) {
            errEl.textContent = data?.error || 'Lỗi không xác định';
            errEl.style.display = 'block';
            return;
        }

        successEl.textContent = '✅ ' + data.message;
        successEl.style.display = 'block';
        showCtvToast('Đã lưu thông tin ngân hàng thành công!');

        // Reload banking display
        setTimeout(() => loadBankingInfo(refCode), 500);
    } catch (err) {
        errEl.textContent = 'Lỗi: ' + err.message;
        errEl.style.display = 'block';
    } finally {
        btn.disabled = false;
        btn.textContent = '💾 Lưu Thông Tin';
    }
});

// --- Withdrawal ---
window.submitWithdrawal = async function (e) {
    e.preventDefault();
    const amount = parseInt(document.getElementById('wdAmount').value);
    const bank = document.getElementById('wdBank').value;
    const account = document.getElementById('wdAccount').value.trim();
    const holder = document.getElementById('wdHolder').value.trim();
    const note = document.getElementById('wdNote').value.trim();
    const errEl = document.getElementById('wdError');
    const btn = document.getElementById('wdBtn');
    const data = window._ctvData;

    if (!data) { errEl.textContent = 'Chưa đăng nhập'; errEl.style.display = 'block'; return; }
    if (!amount || !bank || !account || !holder) {
        errEl.textContent = 'Vui lòng điền đầy đủ thông tin';
        errEl.style.display = 'block'; return;
    }
    if (amount < 50000) {
        errEl.textContent = 'Số tiền tối thiểu là 50.000₫';
        errEl.style.display = 'block'; return;
    }
    if (amount > (data.available_vnd || 0)) {
        errEl.textContent = `Số dư khả dụng chỉ ${(data.available_vnd || 0).toLocaleString('vi-VN')}₫`;
        errEl.style.display = 'block'; return;
    }

    btn.disabled = true;
    btn.textContent = 'Đang gửi...';
    errEl.style.display = 'none';

    try {
        const { error } = await supabase.from('withdrawals').insert({
            ctv_code: data.referral_code,
            ctv_name: data.name,
            amount, bank_name: bank,
            bank_account: account,
            bank_holder: holder,
            note: note || null,
        });
        if (error) throw error;

        showCtvToast(`Yêu cầu rút ${amount.toLocaleString('vi-VN')}₫ đã gửi. Admin sẽ xử lý trong 24h.`);
        document.getElementById('withdrawForm').reset();
        loadWithdrawals(data.referral_code, data.name);
    } catch (err) {
        errEl.textContent = 'Lỗi: ' + err.message;
        errEl.style.display = 'block';
    } finally {
        btn.disabled = false;
        btn.textContent = 'Gửi Yêu Cầu Rút Tiền';
    }
};

async function loadWithdrawals(refCode) {
    const container = document.getElementById('withdrawHistory');
    try {
        const { data, error } = await supabase.from('withdrawals')
            .select('*').eq('ctv_code', refCode)
            .order('created_at', { ascending: false }).limit(10);

        if (!data?.length) {
            container.innerHTML = '<div class="ctv-empty">Chưa có yêu cầu rút tiền</div>';
            return;
        }

        const statusMap = {
            pending: ['Chờ duyệt', 'badge-wd-pending'],
            approved: ['Đã duyệt', 'badge-wd-approved'],
            paid: ['Đã thanh toán', 'badge-wd-paid'],
            rejected: ['Từ chối', 'badge-wd-rejected'],
        };

        const fmtDate = (d) => new Date(d).toLocaleDateString('vi-VN', {
            day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit'
        });

        container.innerHTML = `<table class="ctv-table">
            <thead><tr><th>Ngày</th><th>Số tiền</th><th>Ngân hàng</th><th>Trạng thái</th></tr></thead>
            <tbody>
                ${data.map(w => {
            const [label, cls] = statusMap[w.status] || statusMap.pending;
            return `<tr>
                        <td>${fmtDate(w.created_at)}</td>
                        <td style="color:var(--gold-light);font-weight:600">${Number(w.amount).toLocaleString('vi-VN')}₫</td>
                        <td>${escapeHTML(w.bank_name)}</td>
                        <td><span class="${cls}">${label}</span></td>
                    </tr>`;
        }).join('')}
            </tbody>
        </table>`;
    } catch (err) {
        container.innerHTML = '<div class="ctv-empty">Lỗi tải dữ liệu</div>';
    }
}

function showCtvToast(msg, isError = false) {
    let t = document.getElementById('ctvToast');
    if (!t) {
        t = document.createElement('div');
        t.id = 'ctvToast';
        t.className = 'ctv-toast';
        document.body.appendChild(t);
    }
    t.textContent = msg;
    t.className = `ctv-toast show ${isError ? 'error' : ''}`;
    setTimeout(() => t.classList.remove('show'), 3500);
}
// ====================================
// NOTIFICATIONS
// ====================================
async function loadNotifications(refCode) {
    try {
        const { data, error } = await supabase.rpc('get_ctv_notifications', {
            p_ref_code: refCode
        });
        if (error) throw error;
        if (!data?.ok) return;

        // Update badge
        const badge = document.getElementById('notifBadge');
        const unread = data.unread_count || 0;
        if (unread > 0) {
            badge.textContent = unread > 9 ? '9+' : unread;
            badge.classList.add('show');
        }

        // Render list
        const list = document.getElementById('notifList');
        const notifications = data.notifications || [];
        if (!notifications.length) {
            list.innerHTML = '<div class="notif-empty">Chưa có thông báo</div>';
            return;
        }

        const typeIcon = {
            'new_order': '🛒',
            'commission': '💰',
            'withdrawal_approved': '✅',
            'post_reward': '✍️'
        };

        list.innerHTML = notifications.map(n => {
            const time = new Date(n.created_at).toLocaleDateString('vi-VN', {
                day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit'
            });
            const icon = typeIcon[n.type] || '📢';
            return `<div class="notif-item ${n.is_read ? '' : 'unread'}" data-id="${parseInt(n.id)}">
                <div class="notif-item-title">${icon} ${escapeHTML(n.title)}</div>
                ${n.message ? `<div class="notif-item-msg">${escapeHTML(n.message)}</div>` : ''}
                <div class="notif-item-time">${time}</div>
            </div>`;
        }).join('');

        // Click to mark as read
        list.querySelectorAll('.notif-item.unread').forEach(el => {
            el.addEventListener('click', async () => {
                const nId = parseInt(el.dataset.id);
                el.classList.remove('unread');
                try {
                    await supabase.rpc('mark_notification_read', {
                        p_ref_code: refCode,
                        p_notification_id: nId
                    });
                    const current = parseInt(badge.textContent) || 0;
                    if (current <= 1) {
                        badge.classList.remove('show');
                    } else {
                        badge.textContent = current - 1;
                    }
                } catch (err) {
                    console.warn('Mark read error:', err);
                }
            });
        });
    } catch (err) {
        console.warn('Notifications load error:', err);
    }
}

// Toggle notification dropdown
document.getElementById('notifBell').addEventListener('click', (e) => {
    e.stopPropagation();
    document.getElementById('notifDropdown').classList.toggle('open');
});

// Close dropdown on outside click
document.addEventListener('click', () => {
    document.getElementById('notifDropdown').classList.remove('open');
});

// ====================================
// ONBOARDING WIZARD (DB-backed)
// ====================================
function initOnboarding(data) {
    const wizard = document.getElementById('obWizard');
    if (!wizard) return;

    // Use DB-backed onboarding_step (0-5)
    const dbStep = data.onboarding_step || 0;

    // Also check live data for auto-advancement
    const hasCopiedLink = dbStep >= 1 || localStorage.getItem('ctv_link_copied') === 'true';
    const ordersCount = data.total_points ? Math.floor(data.total_points / 10) : 0;
    const has3Orders = dbStep >= 2 || ordersCount >= 3;
    const hasWithdrawn = dbStep >= 3 || (data.available_vnd || 0) > 0;

    let doneCount = 0;
    if (hasCopiedLink) { document.getElementById('obStep1').classList.add('done'); doneCount++; }
    else { document.getElementById('obStep1').classList.add('active'); }

    if (has3Orders) { document.getElementById('obStep2').classList.add('done'); doneCount++; }
    else if (hasCopiedLink) { document.getElementById('obStep2').classList.add('active'); }

    if (hasWithdrawn) { document.getElementById('obStep3').classList.add('done'); doneCount++; }
    else if (has3Orders) { document.getElementById('obStep3').classList.add('active'); }

    // Sync to DB if live data shows more progress than DB
    if (doneCount > dbStep) {
        saveOnboardingStep(data.referral_code, doneCount);
    }

    // If all done, save and hide
    if (doneCount >= 3) {
        saveOnboardingStep(data.referral_code, 3);
        return;
    }

    // Update progress
    document.getElementById('obProgress').textContent = `${doneCount}/3 hoàn thành`;
    document.getElementById('obBarFill').style.width = `${Math.round(doneCount / 3 * 100)}%`;

    wizard.style.display = 'block';
}

async function saveOnboardingStep(refCode, step) {
    try {
        await supabase.rpc('update_onboarding_step', {
            p_ref_code: refCode,
            p_step: step
        });
    } catch (err) {
        console.warn('Onboarding save error:', err.message);
    }
}

window.dismissOnboarding = function () {
    const refCode = localStorage.getItem('ctv_ref_code');
    if (refCode) saveOnboardingStep(refCode, 5);
    document.getElementById('obWizard').style.display = 'none';
};

// ===== SHARE CENTER LOGIC =====
let _shareUrl = '';

function initShareCenter(refCode) {
    _shareUrl = `${window.location.origin}/?ref=${refCode}`;
    const encoded = encodeURIComponent(_shareUrl);
    const shareText = encodeURIComponent('Đông Trùng Hạ Thảo sấy thăng hoa — hỗ trợ sức khỏe tự nhiên. Xem tại đây:');

    // Populate link
    document.getElementById('shareLinkUrl').textContent = _shareUrl;

    // Social share URLs
    document.getElementById('shareZalo').href = `https://zalo.me/share?url=${encoded}`;
    document.getElementById('shareFacebook').href = `https://www.facebook.com/sharer/sharer.php?u=${encoded}&quote=${shareText}`;
    document.getElementById('shareMessenger').href = `https://www.facebook.com/dialog/send?link=${encoded}&app_id=0&redirect_uri=${encoded}`;
    document.getElementById('shareSMS').href = `sms:?body=${shareText}%20${encoded}`;

    // QR Code via Google Charts API
    const qrContainer = document.getElementById('shareQrCanvas');
    const qrImg = document.createElement('img');
    qrImg.src = `https://chart.googleapis.com/chart?chs=200x200&cht=qr&chl=${encoded}&choe=UTF-8`;
    qrImg.alt = 'QR Code giới thiệu';
    qrImg.id = 'shareQrImg';
    qrContainer.innerHTML = '';
    qrContainer.appendChild(qrImg);

    // Replace [LINK] in pre-written messages
    document.querySelectorAll('.share-msg-text').forEach(el => {
        el.textContent = el.textContent.replace('[LINK]', _shareUrl);
    });
}

// Copy share link
window.copyShareLink = function () {
    navigator.clipboard.writeText(_shareUrl).then(() => {
        const btn = document.getElementById('shareLinkCopy');
        btn.textContent = 'Đã copy!';
        btn.classList.add('copied');
        setTimeout(() => {
            btn.textContent = 'Copy Link';
            btn.classList.remove('copied');
        }, 2000);

        // Track for onboarding
        localStorage.setItem('ctv_link_copied', 'true');
        const step1 = document.getElementById('obStep1');
        if (step1) { step1.classList.remove('active'); step1.classList.add('done'); }
        const refCode = localStorage.getItem('ctv_ref_code');
        if (refCode) saveOnboardingStep(refCode, 1);
    }).catch(() => {
        // Fallback for older browsers
        const ta = document.createElement('textarea');
        ta.value = _shareUrl;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        const btn = document.getElementById('shareLinkCopy');
        btn.textContent = 'Đã copy!';
        setTimeout(() => { btn.textContent = 'Copy Link'; }, 2000);
    });
};

// Copy pre-written message
window.copyShareMsg = function (card) {
    const text = card.querySelector('.share-msg-text').textContent;
    const copyBtn = card.querySelector('.share-msg-copy');
    navigator.clipboard.writeText(text).then(() => {
        copyBtn.textContent = 'Đã copy!';
        copyBtn.classList.add('copied');
        setTimeout(() => {
            copyBtn.textContent = 'Copy';
            copyBtn.classList.remove('copied');
        }, 2000);
    }).catch(() => {
        const ta = document.createElement('textarea');
        ta.value = text;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        copyBtn.textContent = 'Đã copy!';
        setTimeout(() => { copyBtn.textContent = 'Copy'; }, 2000);
    });
};

// Download QR code as image
window.downloadQR = function () {
    const img = document.getElementById('shareQrImg');
    if (!img) return;
    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 400;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 400, 400);
    const tmpImg = new Image();
    tmpImg.crossOrigin = 'anonymous';
    tmpImg.onload = () => {
        ctx.drawImage(tmpImg, 0, 0, 400, 400);
        const link = document.createElement('a');
        link.download = 'mdd-qr-code.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
    };
    tmpImg.src = img.src;
};
