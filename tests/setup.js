// ===================================
// Vitest Global Setup
// ===================================
import { vi, beforeEach } from 'vitest';

// Mock supabase module globally
vi.mock('../src/supabase.js', async () => {
    const mock = await import('./mocks/supabase.js');
    return { supabase: mock.supabase };
});

// Mock auth.css import (Vite CSS — not available in test env)
vi.mock('../src/auth.css', () => ({}));

// Clear storage before each test
beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
});
