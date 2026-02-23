// ===================================
// EVENT TRACKING — CTA clicks, page views, scroll depth
// V3 #6A: Track user interactions for data-driven decisions
// ===================================
import { supabase } from '../supabase.js';

// Session ID (anonymous, per-session)
const SESSION_ID = sessionStorage.getItem('mdd_session')
    || (() => { const id = crypto.randomUUID?.() || Math.random().toString(36).slice(2); sessionStorage.setItem('mdd_session', id); return id; })();

// Queue + debounce to batch events
let eventQueue = [];
let flushTimer = null;

function queueEvent(eventType, elementId, metadata = {}) {
    eventQueue.push({
        p_event_type: eventType,
        p_element_id: elementId,
        p_page: window.location.pathname,
        p_metadata: metadata,
        p_session_id: SESSION_ID,
    });

    // Flush after 2 seconds of inactivity
    clearTimeout(flushTimer);
    flushTimer = setTimeout(flushEvents, 2000);
}

async function flushEvents() {
    if (eventQueue.length === 0) return;
    const batch = [...eventQueue];
    eventQueue = [];

    try {
        // Send each event (Supabase RPC doesn't support batch natively)
        await Promise.allSettled(
            batch.map(ev => supabase.rpc('log_event', ev))
        );
    } catch {
        // Silent — tracking should never break the app
    }
}

// Flush on page unload
if (typeof window !== 'undefined') {
    window.addEventListener('beforeunload', flushEvents);
    window.addEventListener('visibilitychange', () => {
        if (document.hidden) flushEvents();
    });
}

/**
 * Track CTA clicks automatically
 * Finds all CTAs by selector and attaches click handlers
 */
export function initEventTracking() {
    // Track page view
    queueEvent('page_view', null, {
        referrer: document.referrer || 'direct',
        viewport: `${window.innerWidth}x${window.innerHeight}`,
        device: window.innerWidth < 768 ? 'mobile' : 'desktop',
    });

    // Track CTA clicks
    const ctaSelectors = [
        '.hero-cta-btn',
        '.hero-cta-link',
        '.btn-primary',
        '.btn-glow',
        '#promoOrderBtn',
        '#orderSubmitBtn',
        '.product-order-cta',
        '.ctv-trigger-btn',
        '#ctvPopupSubmit',
        '[href="#contact"]',
        '[href="tel:"]',
        '[href*="zalo.me"]',
    ];

    // Use event delegation on document for efficiency
    document.addEventListener('click', (e) => {
        const target = e.target.closest(ctaSelectors.join(','));
        if (!target) return;

        const elementId = target.id
            || target.getAttribute('href')
            || target.className.split(' ').find(c => c.startsWith('hero-') || c.startsWith('btn-') || c.startsWith('ctv-'))
            || 'unknown';

        queueEvent('cta_click', elementId, {
            text: target.textContent?.trim().slice(0, 80),
            section: target.closest('section')?.id || 'global',
        });
    });

    // Track scroll depth (25%, 50%, 75%, 100%)
    const scrollMilestones = new Set();
    let scrollTicking = false;

    window.addEventListener('scroll', () => {
        if (scrollTicking) return;
        scrollTicking = true;

        requestAnimationFrame(() => {
            const scrollPct = Math.round(
                (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100
            );

            [25, 50, 75, 100].forEach(milestone => {
                if (scrollPct >= milestone && !scrollMilestones.has(milestone)) {
                    scrollMilestones.add(milestone);
                    queueEvent('scroll_depth', null, { depth: milestone });
                }
            });

            scrollTicking = false;
        });
    }, { passive: true });
}
