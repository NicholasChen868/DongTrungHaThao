// Re-export the mock supabase for direct access in tests
// The actual mock is defined in tests/setup.js via vi.mock
export { supabase } from '../../src/supabase.js';

// Helper to get the chainable query builder from the mock
export function getQueryBuilder() {
    const { supabase } = require('../../src/supabase.js');
    return supabase.__queryBuilder;
}
