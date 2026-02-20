/**
 * Lightweight page view tracker.
 * Tracks: page path, referrer, UTM params, device type.
 * No PII. No cookies. Fire-and-forget.
 */
import { supabase } from '../supabase.js';

function getDevice() {
    const w = window.innerWidth;
    if (w < 768) return 'mobile';
    if (w < 1024) return 'tablet';
    return 'desktop';
}

function getUTM(key) {
    try {
        return new URLSearchParams(location.search).get(key) || null;
    } catch { return null; }
}

export function trackPageView() {
    // Don't track admin
    if (location.pathname.includes('admin')) return;

    // Debounce: max 1 view per page per session
    const sessionKey = `pv_${location.pathname}`;
    if (sessionStorage.getItem(sessionKey)) return;
    sessionStorage.setItem(sessionKey, '1');

    const data = {
        page: location.pathname || '/',
        referrer: document.referrer ? new URL(document.referrer).hostname : null,
        utm_source: getUTM('utm_source') || getUTM('ref') || null,
        utm_medium: getUTM('utm_medium') || null,
        device: getDevice(),
    };

    // Fire and forget — don't await, don't block
    supabase.from('page_views').insert(data).then(() => { });
}

// Auto-track on import
trackPageView();
