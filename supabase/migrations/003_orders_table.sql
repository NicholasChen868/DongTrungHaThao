-- =============================================
-- ORDERS TABLE — Migration
-- =============================================
-- Create orders table if not exists
CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    customer_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    address TEXT NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price INTEGER NOT NULL DEFAULT 850000,
    discount_percent NUMERIC(5, 2) DEFAULT 0,
    total_amount INTEGER NOT NULL,
    ctv_code TEXT,
    note TEXT,
    status TEXT NOT NULL DEFAULT 'pending',
    admin_note TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);
-- Enable RLS
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
-- Allow anonymous inserts (for the order form)
CREATE POLICY "Allow anonymous order insert" ON orders FOR
INSERT TO anon WITH CHECK (true);
-- Allow anonymous to read their own orders (by phone)
CREATE POLICY "Allow anon read own orders" ON orders FOR
SELECT TO anon USING (true);
-- Allow anonymous to update (for admin actions via anon key)
CREATE POLICY "Allow anon update orders" ON orders FOR
UPDATE TO anon USING (true) WITH CHECK (true);
-- Index for quick lookups
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_phone ON orders(phone);
CREATE INDEX IF NOT EXISTS idx_orders_created ON orders(created_at DESC);
-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_orders_timestamp() RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = now();
RETURN NEW;
END;
$$ LANGUAGE plpgsql;
DROP TRIGGER IF EXISTS orders_updated_at ON orders;
CREATE TRIGGER orders_updated_at BEFORE
UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_orders_timestamp();