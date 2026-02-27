-- Bảng lưu yêu cầu hợp tác / liên hệ đại lý
-- Migration: Business model split — thêm form "Liên Hệ Hợp Tác" trên website founder
CREATE TABLE IF NOT EXISTS public.partnership_inquiries (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    type TEXT DEFAULT 'dealer' CHECK (
        type IN ('dealer', 'distributor', 'investor', 'other')
    ),
    location TEXT,
    note TEXT,
    status TEXT DEFAULT 'pending' CHECK (
        status IN ('pending', 'contacted', 'approved', 'rejected')
    ),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);
-- RLS: cho phép anonymous insert (form public trên website)
ALTER TABLE public.partnership_inquiries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Cho phép gửi yêu cầu hợp tác (public)" ON public.partnership_inquiries FOR
INSERT TO anon,
    authenticated WITH CHECK (true);
-- Admin được đọc tất cả
CREATE POLICY "Admin đọc partnership inquiries" ON public.partnership_inquiries FOR
SELECT TO authenticated USING (
        EXISTS (
            SELECT 1
            FROM public.profiles
            WHERE profiles.id = auth.uid()
                AND profiles.role = 'admin'
        )
    );
-- Index để query nhanh
CREATE INDEX idx_partnership_inquiries_status ON public.partnership_inquiries(status);
CREATE INDEX idx_partnership_inquiries_created ON public.partnership_inquiries(created_at DESC);