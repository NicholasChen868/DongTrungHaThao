// ===================================
// Vitest Global Setup
// ===================================
import { vi, beforeEach } from 'vitest';

// Mock supabase module globally — inline mock (synchronous)
vi.mock('../src/supabase.js', () => {
    // Chainable query builder
    const createQueryBuilder = () => {
        const builder = {
            insert: vi.fn(() => builder),
            select: vi.fn(() => builder),
            update: vi.fn(() => builder),
            delete: vi.fn(() => builder),
            eq: vi.fn(() => builder),
            neq: vi.fn(() => builder),
            single: vi.fn(() => Promise.resolve({ data: null, error: null })),
            maybeSingle: vi.fn(() => Promise.resolve({ data: null, error: null })),
            then: vi.fn((cb) => cb({ data: null, error: null })),
        };
        return builder;
    };

    const queryBuilder = createQueryBuilder();

    return {
        supabase: {
            from: vi.fn(() => queryBuilder),
            rpc: vi.fn(() => Promise.resolve({ data: null, error: null })),
            auth: {
                signInWithPassword: vi.fn(),
                signOut: vi.fn(),
                getSession: vi.fn(),
            },
            // Expose queryBuilder for test access
            __queryBuilder: queryBuilder,
        },
    };
});

// Mock auth.css import (Vite CSS — not available in test env)
vi.mock('../src/auth.css', () => ({}));

// Clear storage before each test
beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
});
