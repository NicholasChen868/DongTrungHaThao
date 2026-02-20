-- =============================================
-- MEMBERS TABLE — Migration
-- =============================================
CREATE TABLE IF NOT EXISTS members (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    phone TEXT NOT NULL UNIQUE,
    email TEXT,
    password_hash TEXT NOT NULL,
    total_points INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);
-- Enable RLS
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
-- Allow anonymous inserts (registration)
CREATE POLICY "Allow anon register" ON members FOR
INSERT TO anon WITH CHECK (true);
-- Allow anonymous to read by phone (login)
CREATE POLICY "Allow anon read members" ON members FOR
SELECT TO anon USING (true);
-- Allow anonymous update (profile)
CREATE POLICY "Allow anon update members" ON members FOR
UPDATE TO anon USING (true) WITH CHECK (true);
-- Indexes
CREATE INDEX IF NOT EXISTS idx_members_phone ON members(phone);
-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_members_timestamp() RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = now();
RETURN NEW;
END;
$$ LANGUAGE plpgsql;
DROP TRIGGER IF EXISTS members_updated_at ON members;
CREATE TRIGGER members_updated_at BEFORE
UPDATE ON members FOR EACH ROW EXECUTE FUNCTION update_members_timestamp();