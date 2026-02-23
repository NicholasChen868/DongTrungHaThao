// ===================================
// ADMIN SESSION — Extracted testable functions
// Login/logout/session management via server-side tokens
// ===================================

const SESSION_KEY = 'admin_session_token';
const SESSION_EXPIRES_KEY = 'admin_session_expires';

/**
 * Lấy session token từ sessionStorage
 */
export function getSessionToken() {
    return sessionStorage.getItem(SESSION_KEY) || '';
}

/**
 * Check session còn hợp lệ (client-side check)
 */
export function isSessionValid() {
    const token = sessionStorage.getItem(SESSION_KEY);
    if (!token) return false;

    const expires = parseInt(sessionStorage.getItem(SESSION_EXPIRES_KEY) || '0');
    if (Date.now() > expires) {
        // Session expired client-side → clear
        clearSession();
        return false;
    }

    return true;
}

/**
 * Lưu session token vào sessionStorage
 */
export function saveSession(token, expiresAt) {
    sessionStorage.setItem(SESSION_KEY, token);
    // Lưu expires_at dạng timestamp ms
    const expiresMs = typeof expiresAt === 'string'
        ? new Date(expiresAt).getTime()
        : expiresAt;
    sessionStorage.setItem(SESSION_EXPIRES_KEY, String(expiresMs));
}

/**
 * Xóa session khỏi sessionStorage
 */
export function clearSession() {
    sessionStorage.removeItem(SESSION_KEY);
    sessionStorage.removeItem(SESSION_EXPIRES_KEY);
    // Cleanup legacy keys
    sessionStorage.removeItem('admin_hash');
    sessionStorage.removeItem('admin_session_ts');
}

/**
 * Admin login — gọi admin_login RPC, lưu session token
 * @param {Object} supabase - Supabase client
 * @param {string} hash - SHA-256 hash của password
 * @returns {{ ok: boolean, error?: string }}
 */
export async function adminLogin(supabase, hash) {
    const { data, error } = await supabase.rpc('admin_login', {
        p_admin_hash: hash,
    });

    if (error) {
        return { ok: false, error: error.message };
    }

    if (data?.ok && data?.session_token) {
        saveSession(data.session_token, data.expires_at);
        return { ok: true };
    }

    return { ok: false, error: 'Đăng nhập thất bại.' };
}

/**
 * Admin logout — gọi admin_logout RPC, xóa session
 * @param {Object} supabase - Supabase client
 */
export async function adminLogout(supabase) {
    const token = getSessionToken();
    if (token) {
        try {
            await supabase.rpc('admin_logout', {
                p_session_token: token,
            });
        } catch (_e) {
            // Best-effort logout — xóa client session regardless
        }
    }
    clearSession();
}
