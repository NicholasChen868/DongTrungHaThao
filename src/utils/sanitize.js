/**
 * HTML entity escape — prevents XSS when inserting user data into innerHTML.
 * Escapes: & < > " ' ` to their HTML entity equivalents.
 */
export function escapeHTML(str) {
    if (str == null) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;')
        .replace(/`/g, '&#96;');
}

/**
 * Sanitize a value for use in CSS (style attributes).
 * Only allows safe CSS values: alphanumeric, #, spaces, commas, parentheses, %, px, deg.
 * Blocks: expressions, url(), javascript:, etc.
 */
export function escapeCSS(str) {
    if (str == null) return '';
    const s = String(str);
    // Block dangerous CSS patterns
    if (/expression|javascript|url\s*\(|@import|behavior|binding/i.test(s)) {
        return '';
    }
    return s;
}
