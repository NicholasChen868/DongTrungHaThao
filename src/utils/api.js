// ===================================
// API UTILITIES — Retry, Error handling, Network status
// ===================================

/**
 * Phân loại lỗi: có nên retry hay không?
 * Chỉ retry network errors (fetch failed) và server errors (5xx).
 * KHÔNG retry: auth errors, validation errors, client errors (4xx).
 */
function isRetryableError(error) {
    if (!error) return false;

    const message = (error.message || '').toLowerCase();

    // Network errors
    if (message.includes('fetch') || message.includes('network') || message.includes('failed to fetch')) {
        return true;
    }
    if (message.includes('timeout') || message.includes('econnrefused') || message.includes('econnreset')) {
        return true;
    }

    // Supabase wraps HTTP errors — check for 5xx
    const code = error.code || error.status || '';
    const codeStr = String(code);
    if (codeStr.startsWith('5') || codeStr === 'PGRST301') {
        return true;
    }

    // Supabase hint for overloaded
    if (message.includes('too many') || message.includes('overloaded') || message.includes('unavailable')) {
        return true;
    }

    return false;
}

/**
 * Tính thời gian chờ exponential backoff: 1s → 2s → 4s
 */
function getBackoffMs(attempt) {
    return Math.min(1000 * Math.pow(2, attempt), 8000);
}

/**
 * Delay helper (cho retry)
 */
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * apiCall — Wrapper cho Supabase calls với retry logic.
 *
 * @param {Function} fn - Async function trả về { data, error } hoặc throw
 * @param {Object} options
 * @param {number} options.retries - Số lần retry (default: 3)
 * @param {string} options.context - Mô tả ngắn cho logging (VD: 'Gửi đơn hàng')
 * @param {Function} options.onRetry - Callback khi retry (attempt, error)
 * @returns {Promise<{data: any, error: any}>}
 */
export async function apiCall(fn, { retries = 3, context = '', onRetry = null } = {}) {
    let lastError = null;

    for (let attempt = 0; attempt <= retries; attempt++) {
        try {
            const result = await fn();

            // Supabase trả { data, error } — check error field
            if (result && result.error) {
                if (attempt < retries && isRetryableError(result.error)) {
                    lastError = result.error;
                    if (onRetry) onRetry(attempt + 1, result.error);
                    await delay(getBackoffMs(attempt));
                    continue;
                }
                // Non-retryable hoặc hết retry → trả về error
                return result;
            }

            return result;
        } catch (error) {
            lastError = error;

            if (attempt < retries && isRetryableError(error)) {
                if (onRetry) onRetry(attempt + 1, error);
                await delay(getBackoffMs(attempt));
                continue;
            }

            // Non-retryable hoặc hết retry → throw
            throw error;
        }
    }

    // Fallback — hết retry
    throw lastError;
}

/**
 * Chuyển error thành message tiếng Việt thân thiện cho user.
 */
export function getVietnameseErrorMessage(error) {
    if (!error) return 'Đã xảy ra lỗi không xác định.';

    const message = (error.message || '').toLowerCase();

    // Network / connectivity
    if (message.includes('fetch') || message.includes('network') || message.includes('failed to fetch')) {
        return 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng và thử lại.';
    }

    // Timeout
    if (message.includes('timeout')) {
        return 'Yêu cầu quá lâu. Vui lòng thử lại sau.';
    }

    // Rate limit
    if (message.includes('rate limit') || message.includes('too many requests') || message.includes('429')) {
        return 'Quá nhiều yêu cầu. Vui lòng đợi vài phút rồi thử lại.';
    }

    // Auth
    if (message.includes('unauthorized') || message.includes('authentication') || message.includes('401')) {
        return 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.';
    }

    // Permission
    if (message.includes('forbidden') || message.includes('permission') || message.includes('403')) {
        return 'Bạn không có quyền thực hiện thao tác này.';
    }

    // Server error
    if (message.includes('500') || message.includes('internal server') || message.includes('unavailable')) {
        return 'Máy chủ đang gặp sự cố. Vui lòng thử lại sau ít phút.';
    }

    // Generic
    return 'Đã xảy ra lỗi. Vui lòng thử lại hoặc liên hệ hotline.';
}

/**
 * handleApiError — Log error + hiện toast tiếng Việt.
 *
 * @param {Error|Object} error - Lỗi từ Supabase hoặc JS Error
 * @param {string} context - Mô tả context (VD: 'Gửi đơn hàng')
 * @param {Function} toastFn - Function hiện toast (showToast hoặc showAdminToast)
 */
export function handleApiError(error, context, toastFn) {
    const userMessage = getVietnameseErrorMessage(error);

    // Log cho developer
    console.error(`[${context}]`, error);

    // Hiện toast cho user
    if (typeof toastFn === 'function') {
        toastFn(userMessage, false);
    }

    return userMessage;
}

/**
 * fireAndForget — Cho analytics/tracking calls.
 * Không throw, không retry, chỉ log warning nếu lỗi.
 *
 * @param {Function} fn - Async function
 * @param {string} context - Mô tả (cho logging)
 */
export function fireAndForget(fn, context = 'background') {
    try {
        const result = fn();
        if (result && typeof result.catch === 'function') {
            result.catch(err => {
                console.warn(`[${context}] fire-and-forget error:`, err?.message || err);
            });
        }
    } catch (err) {
        console.warn(`[${context}] fire-and-forget error:`, err?.message || err);
    }
}

/**
 * initNetworkStatus — Detect mất mạng / có mạng lại.
 *
 * @param {Function} onOffline - Callback khi mất mạng
 * @param {Function} onOnline - Callback khi có mạng lại
 * @returns {Function} cleanup function để remove listeners
 */
export function initNetworkStatus(onOffline, onOnline) {
    const handleOffline = () => {
        if (typeof onOffline === 'function') onOffline();
    };
    const handleOnline = () => {
        if (typeof onOnline === 'function') onOnline();
    };

    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);

    // Return cleanup function
    return () => {
        window.removeEventListener('offline', handleOffline);
        window.removeEventListener('online', handleOnline);
    };
}

// Export helpers cho testing
export { isRetryableError, getBackoffMs };
