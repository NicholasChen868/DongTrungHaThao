// Mock Supabase client for tests
import { vi } from 'vitest';

// Chainable query builder mock
function createQueryBuilder() {
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
}

export const mockQueryBuilder = createQueryBuilder();

export const supabase = {
    from: vi.fn(() => mockQueryBuilder),
    rpc: vi.fn(() => Promise.resolve({ data: null, error: null })),
    auth: {
        signInWithPassword: vi.fn(),
        signOut: vi.fn(),
        getSession: vi.fn(),
    },
};

// Helper to reset all mocks
export function resetSupabaseMocks() {
    supabase.from.mockClear();
    supabase.rpc.mockClear();
    Object.values(mockQueryBuilder).forEach(fn => {
        if (typeof fn.mockClear === 'function') fn.mockClear();
    });
}
