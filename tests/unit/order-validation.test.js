import { describe, it, expect } from 'vitest';

// Order price calculation logic (extracted from src/main.js)
const UNIT_PRICE = 850000;
const DISCOUNTS = { 1: 0, 2: 0, 3: 0.05, 5: 0.10, 10: 0.15 };

function calculateOrder(qty) {
  const discount = DISCOUNTS[qty] || 0;
  const subtotal = qty * UNIT_PRICE;
  const total = Math.round(subtotal * (1 - discount));
  return { subtotal, discount, total };
}

function validatePhone(phone) {
  // Vietnamese phone: 10 digits, starts with 0
  return /^0\d{9}$/.test(phone);
}

describe('Order price calculation', () => {
  it('calculates 1 box correctly (no discount)', () => {
    const { subtotal, discount, total } = calculateOrder(1);
    expect(subtotal).toBe(850000);
    expect(discount).toBe(0);
    expect(total).toBe(850000);
  });

  it('calculates 2 boxes correctly (no discount)', () => {
    const { subtotal, total } = calculateOrder(2);
    expect(subtotal).toBe(1700000);
    expect(total).toBe(1700000);
  });

  it('calculates 3 boxes correctly (5% discount)', () => {
    const { subtotal, discount, total } = calculateOrder(3);
    expect(subtotal).toBe(2550000);
    expect(discount).toBe(0.05);
    expect(total).toBe(2422500);
  });

  it('calculates 5 boxes correctly (10% discount)', () => {
    const { subtotal, discount, total } = calculateOrder(5);
    expect(subtotal).toBe(4250000);
    expect(discount).toBe(0.10);
    expect(total).toBe(3825000);
  });

  it('calculates 10 boxes correctly (15% discount)', () => {
    const { subtotal, discount, total } = calculateOrder(10);
    expect(subtotal).toBe(8500000);
    expect(discount).toBe(0.15);
    expect(total).toBe(7225000);
  });

  it('returns 0 discount for unknown quantity', () => {
    const { discount } = calculateOrder(7);
    expect(discount).toBe(0);
  });

  it('total is always integer (no floating point)', () => {
    for (const qty of [1, 2, 3, 5, 10]) {
      const { total } = calculateOrder(qty);
      expect(Number.isInteger(total)).toBe(true);
    }
  });
});

describe('Phone validation', () => {
  it('accepts valid Vietnamese phone numbers', () => {
    expect(validatePhone('0912345678')).toBe(true);
    expect(validatePhone('0388888888')).toBe(true);
    expect(validatePhone('0701234567')).toBe(true);
  });

  it('rejects numbers not starting with 0', () => {
    expect(validatePhone('1234567890')).toBe(false);
    expect(validatePhone('9912345678')).toBe(false);
  });

  it('rejects numbers with wrong length', () => {
    expect(validatePhone('091234567')).toBe(false);   // 9 digits
    expect(validatePhone('09123456789')).toBe(false);  // 11 digits
    expect(validatePhone('091')).toBe(false);
  });

  it('rejects non-numeric input', () => {
    expect(validatePhone('abcdefghij')).toBe(false);
    expect(validatePhone('091234567a')).toBe(false);
  });

  it('rejects empty input', () => {
    expect(validatePhone('')).toBe(false);
  });
});
