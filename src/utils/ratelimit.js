/**
 * Client-side rate limiting using localStorage.
 * Prevents brute-force login attempts and form spam.
 */

const STORAGE_PREFIX = 'rl_';

/**
 * Check if an action is rate-limited.
 * @param {string} key - Unique identifier for the action (e.g., 'login', 'order')
 * @param {number} maxAttempts - Maximum attempts allowed in the window
 * @param {number} windowMs - Time window in milliseconds
 * @returns {{ allowed: boolean, remainingMs: number, attempts: number }}
 */
export function checkRateLimit(key, maxAttempts, windowMs) {
    const storageKey = STORAGE_PREFIX + key;
    const now = Date.now();

    let record;
    try {
        record = JSON.parse(localStorage.getItem(storageKey));
    } catch { record = null; }

    if (!record || now - record.start > windowMs) {
        // Window expired, start fresh
        record = { start: now, attempts: 0 };
    }

    const remainingMs = Math.max(0, windowMs - (now - record.start));

    if (record.attempts >= maxAttempts) {
        return { allowed: false, remainingMs, attempts: record.attempts };
    }

    return { allowed: true, remainingMs, attempts: record.attempts };
}

/**
 * Record an attempt for rate limiting.
 * Call this AFTER checkRateLimit returns allowed: true.
 * @param {string} key
 * @param {number} windowMs
 */
export function recordAttempt(key, windowMs) {
    const storageKey = STORAGE_PREFIX + key;
    const now = Date.now();

    let record;
    try {
        record = JSON.parse(localStorage.getItem(storageKey));
    } catch { record = null; }

    if (!record || now - record.start > windowMs) {
        record = { start: now, attempts: 0 };
    }

    record.attempts++;
    localStorage.setItem(storageKey, JSON.stringify(record));
}

/**
 * Create a form submission guard with cooldown.
 * Returns a function that checks if submission is allowed.
 * @param {number} cooldownMs - Cooldown between submissions (default 5000ms)
 * @returns {() => { allowed: boolean, remainingMs: number }}
 */
export function createSubmitGuard(cooldownMs = 5000) {
    let lastSubmit = 0;

    return function () {
        const now = Date.now();
        const elapsed = now - lastSubmit;

        if (elapsed < cooldownMs) {
            return { allowed: false, remainingMs: cooldownMs - elapsed };
        }

        lastSubmit = now;
        return { allowed: true, remainingMs: 0 };
    };
}
