import { describe, it, expect } from 'vitest';
import { escapeHTML, escapeCSS } from '../src/utils/sanitize.js';

describe('escapeHTML', () => {
  it('escapes < and > to prevent tag injection', () => {
    expect(escapeHTML('<script>alert(1)</script>')).toBe(
      '&lt;script&gt;alert(1)&lt;/script&gt;'
    );
  });

  it('escapes & in text', () => {
    expect(escapeHTML('Tom & Jerry')).toBe('Tom &amp; Jerry');
  });

  it('escapes double quotes', () => {
    expect(escapeHTML('" onmouseover="alert(1)"')).toBe(
      '&quot; onmouseover=&quot;alert(1)&quot;'
    );
  });

  it('escapes single quotes', () => {
    expect(escapeHTML("' onclick='alert(1)'")).toBe(
      "&#39; onclick=&#39;alert(1)&#39;"
    );
  });

  it('escapes backticks', () => {
    expect(escapeHTML('`${alert(1)}`')).toBe('&#96;${alert(1)}&#96;');
  });

  it('returns empty string for null/undefined', () => {
    expect(escapeHTML(null)).toBe('');
    expect(escapeHTML(undefined)).toBe('');
  });

  it('converts numbers to string', () => {
    expect(escapeHTML(123)).toBe('123');
  });

  it('handles Vietnamese text correctly', () => {
    const vn = 'Nguyễn Văn Hùng — Đông Trùng Hạ Thảo';
    expect(escapeHTML(vn)).toBe(vn);
  });

  it('handles combined XSS vectors', () => {
    const xss = '<img src=x onerror="alert(`XSS`)">';
    const result = escapeHTML(xss);
    expect(result).not.toContain('<');
    expect(result).not.toContain('>');
    expect(result).not.toContain('"');
  });

  it('handles empty string', () => {
    expect(escapeHTML('')).toBe('');
  });
});

describe('escapeCSS', () => {
  it('allows safe color values', () => {
    expect(escapeCSS('#d4a853')).toBe('#d4a853');
    expect(escapeCSS('rgb(212, 168, 83)')).toBe('rgb(212, 168, 83)');
  });

  it('allows safe gradient values', () => {
    const gradient = 'linear-gradient(135deg, #d4a853, #b8860b)';
    expect(escapeCSS(gradient)).toBe(gradient);
  });

  it('blocks expression()', () => {
    expect(escapeCSS('expression(alert(1))')).toBe('');
  });

  it('blocks javascript:', () => {
    expect(escapeCSS('javascript:alert(1)')).toBe('');
  });

  it('blocks url()', () => {
    expect(escapeCSS('url(http://evil.com/steal.js)')).toBe('');
  });

  it('blocks @import', () => {
    expect(escapeCSS('@import url(evil.css)')).toBe('');
  });

  it('blocks behavior', () => {
    expect(escapeCSS('behavior: url(xss.htc)')).toBe('');
  });

  it('returns empty for null/undefined', () => {
    expect(escapeCSS(null)).toBe('');
    expect(escapeCSS(undefined)).toBe('');
  });
});
