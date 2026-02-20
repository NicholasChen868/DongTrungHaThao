import { describe, it, expect, beforeEach, vi } from 'vitest';
import { checkRateLimit, recordAttempt, createSubmitGuard } from '../src/utils/ratelimit.js';

describe('checkRateLimit + recordAttempt', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('allows first attempt', () => {
    const result = checkRateLimit('test', 3, 60000);
    expect(result.allowed).toBe(true);
    expect(result.attempts).toBe(0);
  });

  it('blocks after max attempts reached', () => {
    recordAttempt('test', 60000);
    recordAttempt('test', 60000);
    recordAttempt('test', 60000);

    const result = checkRateLimit('test', 3, 60000);
    expect(result.allowed).toBe(false);
    expect(result.attempts).toBe(3);
    expect(result.remainingMs).toBeGreaterThan(0);
  });

  it('allows attempts under the limit', () => {
    recordAttempt('test', 60000);
    recordAttempt('test', 60000);

    const result = checkRateLimit('test', 3, 60000);
    expect(result.allowed).toBe(true);
    expect(result.attempts).toBe(2);
  });

  it('resets after window expires', () => {
    // Record 3 attempts
    recordAttempt('test', 60000);
    recordAttempt('test', 60000);
    recordAttempt('test', 60000);

    // Simulate window expiry by manipulating localStorage
    const key = 'rl_test';
    const record = JSON.parse(localStorage.getItem(key));
    record.start = Date.now() - 61000; // 61s ago (past the 60s window)
    localStorage.setItem(key, JSON.stringify(record));

    const result = checkRateLimit('test', 3, 60000);
    expect(result.allowed).toBe(true);
    expect(result.attempts).toBe(0);
  });

  it('uses different keys independently', () => {
    recordAttempt('login', 60000);
    recordAttempt('login', 60000);
    recordAttempt('login', 60000);

    const loginResult = checkRateLimit('login', 3, 60000);
    expect(loginResult.allowed).toBe(false);

    const orderResult = checkRateLimit('order', 3, 60000);
    expect(orderResult.allowed).toBe(true);
  });

  it('handles corrupted localStorage gracefully', () => {
    localStorage.setItem('rl_test', 'not-valid-json{');
    const result = checkRateLimit('test', 3, 60000);
    expect(result.allowed).toBe(true);
  });
});

describe('createSubmitGuard', () => {
  it('allows first submission', () => {
    const guard = createSubmitGuard(5000);
    const result = guard();
    expect(result.allowed).toBe(true);
    expect(result.remainingMs).toBe(0);
  });

  it('blocks rapid submissions within cooldown', () => {
    const guard = createSubmitGuard(5000);
    guard(); // first call OK

    const result = guard(); // immediate second call
    expect(result.allowed).toBe(false);
    expect(result.remainingMs).toBeGreaterThan(0);
    expect(result.remainingMs).toBeLessThanOrEqual(5000);
  });

  it('allows submission after cooldown expires', async () => {
    const guard = createSubmitGuard(50); // short cooldown for test
    guard();

    await new Promise(r => setTimeout(r, 60)); // wait past cooldown

    const result = guard();
    expect(result.allowed).toBe(true);
  });
});
