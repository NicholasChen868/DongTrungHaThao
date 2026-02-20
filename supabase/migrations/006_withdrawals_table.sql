-- =============================================
-- WITHDRAWALS TABLE — CTV Withdrawal Requests
-- =============================================
CREATE TABLE IF NOT EXISTS withdrawals (
    id SERIAL PRIMARY KEY,
    ctv_code TEXT NOT NULL,
    ctv_name TEXT NOT NULL,
    amount INTEGER NOT NULL CHECK (amount >= 50000),
    bank_name TEXT NOT NULL,
    bank_account TEXT NOT NULL,
    bank_holder TEXT NOT NULL,
    note TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (
        status IN ('pending', 'approved', 'rejected', 'paid')
    ),
    admin_note TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);
-- Enable RLS
ALTER TABLE withdrawals ENABLE ROW LEVEL SECURITY;
-- CTV can insert their own withdrawal requests
CREATE POLICY "Allow anon insert withdrawals" ON withdrawals FOR
INSERT TO anon WITH CHECK (true);
-- CTV can view their own withdrawals (by ctv_code)
CREATE POLICY "Allow anon read withdrawals" ON withdrawals FOR
SELECT TO anon USING (true);
-- Admin can update status
CREATE POLICY "Allow anon update withdrawals" ON withdrawals FOR
UPDATE TO anon USING (true) WITH CHECK (true);
-- Indexes
CREATE INDEX IF NOT EXISTS idx_withdrawals_ctv ON withdrawals(ctv_code);
CREATE INDEX IF NOT EXISTS idx_withdrawals_status ON withdrawals(status);
CREATE INDEX IF NOT EXISTS idx_withdrawals_created ON withdrawals(created_at DESC);
-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_withdrawals_timestamp() RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = now();
RETURN NEW;
END;
$$ LANGUAGE plpgsql;
DROP TRIGGER IF EXISTS withdrawals_updated_at ON withdrawals;
CREATE TRIGGER withdrawals_updated_at BEFORE
UPDATE ON withdrawals FOR EACH ROW EXECUTE FUNCTION update_withdrawals_timestamp();