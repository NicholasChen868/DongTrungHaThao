-- ===================================
-- ĐÔNG TRÙNG HẠ THẢO — SUPABASE MIGRATION
-- Chuyển toàn bộ hardcode data sang database
-- ===================================
-- 1. PRODUCTS
CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    brand TEXT NOT NULL,
    tagline TEXT,
    short_description TEXT,
    description TEXT,
    price INTEGER NOT NULL,
    price_formatted TEXT,
    unit TEXT DEFAULT 'hộp',
    capsule_count INTEGER,
    capsule_unit TEXT,
    ingredients TEXT [],
    usage_instructions TEXT,
    storage TEXT,
    certification TEXT,
    origin TEXT DEFAULT 'Việt Nam',
    created_at TIMESTAMPTZ DEFAULT now()
);
-- 2. PRODUCT BENEFITS
CREATE TABLE IF NOT EXISTS product_benefits (
    id SERIAL PRIMARY KEY,
    product_id TEXT REFERENCES products(id) ON DELETE CASCADE,
    icon TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    sort_order INTEGER DEFAULT 0
);
-- 3. TESTIMONIALS
CREATE TABLE IF NOT EXISTS testimonials (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    age INTEGER,
    location TEXT,
    avatar TEXT DEFAULT '👤',
    rating INTEGER DEFAULT 5 CHECK (
        rating >= 1
        AND rating <= 5
    ),
    quote TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);
-- 4. PROCESS STEPS
CREATE TABLE IF NOT EXISTS process_steps (
    id SERIAL PRIMARY KEY,
    step INTEGER NOT NULL,
    title TEXT NOT NULL,
    icon TEXT NOT NULL,
    description TEXT NOT NULL,
    duration TEXT,
    sort_order INTEGER DEFAULT 0
);
-- 5. AFFILIATE TIERS
CREATE TABLE IF NOT EXISTS affiliate_tiers (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    icon TEXT NOT NULL,
    min_sales INTEGER NOT NULL,
    max_sales INTEGER,
    commission INTEGER NOT NULL,
    color TEXT NOT NULL,
    gradient TEXT,
    perks TEXT [],
    sort_order INTEGER DEFAULT 0
);
-- 6. AFFILIATE STEPS (How It Works)
CREATE TABLE IF NOT EXISTS affiliate_steps (
    id SERIAL PRIMARY KEY,
    step INTEGER NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    sort_order INTEGER DEFAULT 0
);
-- ===================================
-- INSERT DATA
-- ===================================
-- Product
INSERT INTO products (
        id,
        name,
        brand,
        tagline,
        short_description,
        description,
        price,
        price_formatted,
        unit,
        capsule_count,
        capsule_unit,
        ingredients,
        usage_instructions,
        storage,
        certification,
        origin
    )
VALUES (
        'dtht-capsule-001',
        'Viên Nang Đông Trùng Hạ Thảo',
        'maldalladuyduc',
        'Tinh Hoa Thiên Nhiên — Sức Khỏe Trường Thọ',
        'Viên nang con nhộng Đông Trùng Hạ Thảo nguyên chất, bào chế trực tiếp từ quy trình sản xuất khép kín, đảm bảo giữ trọn dưỡng chất quý giá.',
        'Sản phẩm Viên Nang Đông Trùng Hạ Thảo maldalladuyduc được bào chế từ 100% con nhộng Đông Trùng Hạ Thảo (Cordyceps militaris) nuôi cấy trong môi trường chuẩn GMP. Quy trình sản xuất khép kín từ khâu nuôi cấy, thu hoạch, sấy khô đến đóng viên nang, đảm bảo giữ nguyên hàm lượng Cordycepin và Adenosine — hai hoạt chất quý nhất của Đông Trùng Hạ Thảo.',
        850000,
        '850.000₫',
        'hộp',
        60,
        'viên/hộp',
        ARRAY ['Bột nhộng trùng thảo (Cordyceps militaris) — 500mg/viên', 'Vỏ nang thực vật (HPMC)', 'Không chất bảo quản, không phẩm màu'],
        'Uống 2 viên/ngày (sáng và tối), trước bữa ăn 30 phút. Dùng liên tục trong 2-3 tháng để đạt hiệu quả tốt nhất.',
        'Bảo quản nơi khô ráo, thoáng mát, tránh ánh nắng trực tiếp. Nhiệt độ dưới 30°C.',
        'Đạt tiêu chuẩn GMP — WHO',
        'Việt Nam'
    );
-- Product Benefits
INSERT INTO product_benefits (product_id, icon, title, description, sort_order)
VALUES (
        'dtht-capsule-001',
        '🛡️',
        'Tăng Cường Miễn Dịch',
        'Cordycepin giúp kích hoạt hệ miễn dịch tự nhiên, bảo vệ cơ thể trước tác nhân gây bệnh.',
        1
    ),
    (
        'dtht-capsule-001',
        '⚡',
        'Bồi Bổ Sức Khỏe',
        'Cung cấp năng lượng bền bỉ, giảm mệt mỏi, tăng cường thể lực cho người lao động và vận động viên.',
        2
    ),
    (
        'dtht-capsule-001',
        '🫁',
        'Hỗ Trợ Hô Hấp',
        'Cải thiện chức năng phổi, giảm ho, hen suyễn, viêm phế quản mãn tính.',
        3
    ),
    (
        'dtht-capsule-001',
        '❤️',
        'Bảo Vệ Tim Mạch',
        'Giúp điều hòa huyết áp, giảm cholesterol xấu, phòng ngừa xơ vữa động mạch.',
        4
    ),
    (
        'dtht-capsule-001',
        '🧠',
        'Tăng Cường Trí Não',
        'Adenosine cải thiện tuần hoàn não, tăng khả năng tập trung và trí nhớ.',
        5
    ),
    (
        'dtht-capsule-001',
        '🌿',
        'Chống Lão Hóa',
        'Chất chống oxy hóa mạnh giúp làm chậm quá trình lão hóa, giữ làn da tươi trẻ.',
        6
    );
-- Testimonials
INSERT INTO testimonials (name, age, location, avatar, rating, quote)
VALUES (
        'Nguyễn Văn Hùng',
        58,
        'Hà Nội',
        '👤',
        5,
        'Sau 2 tháng sử dụng, tôi cảm thấy khỏe hơn rõ rệt. Giấc ngủ sâu hơn, sáng dậy không còn mệt mỏi. Sản phẩm rất tốt!'
    ),
    (
        'Trần Thị Mai',
        45,
        'TP. Hồ Chí Minh',
        '👩',
        5,
        'Tôi bị viêm phế quản mãn tính, uống thuốc tây hoài không khỏi. Dùng Đông Trùng Hạ Thảo maldalladuyduc được 3 tháng, triệu chứng giảm rất nhiều.'
    ),
    (
        'Phạm Đức Anh',
        35,
        'Đà Nẵng',
        '👤',
        5,
        'Công việc áp lực, thường xuyên thức khuya. Từ khi dùng sản phẩm, tôi thấy tỉnh táo hơn, tập trung tốt hơn trong công việc.'
    ),
    (
        'Lê Thị Hương',
        62,
        'Cần Thơ',
        '👩',
        4,
        'Con gái mua cho tôi dùng thử. Ban đầu không tin lắm nhưng sau 1 tháng thấy đỡ đau xương khớp, da dẻ cũng hồng hào hơn.'
    ),
    (
        'Võ Minh Tuấn',
        50,
        'Huế',
        '👤',
        5,
        'Tôi đã thử nhiều sản phẩm ĐTHT nhưng của maldalladuyduc là tốt nhất. Viên nang dễ uống, thấy hiệu quả nhanh. Rất đáng tiền!'
    ),
    (
        'Đặng Thị Lan',
        55,
        'Nha Trang',
        '👩',
        5,
        'Chồng tôi bị huyết áp cao, dùng sản phẩm này kết hợp với thuốc bác sĩ kê. Huyết áp ổn định hơn rất nhiều, bác sĩ cũng khen.'
    );
-- Process Steps
INSERT INTO process_steps (
        step,
        title,
        icon,
        description,
        duration,
        sort_order
    )
VALUES (
        1,
        'Nuôi Cấy Giống',
        '🔬',
        'Chọn lọc chủng nấm Cordyceps militaris chất lượng cao. Nuôi cấy trong phòng thí nghiệm vô trùng với điều kiện nhiệt độ và độ ẩm tối ưu.',
        '2-3 tuần',
        1
    ),
    (
        2,
        'Nuôi Trồng Nhộng',
        '🌱',
        'Cấy giống vào môi trường dinh dưỡng đặc biệt. Theo dõi 24/7 trong nhà nuôi trồng chuẩn GMP với hệ thống kiểm soát tự động.',
        '45-60 ngày',
        2
    ),
    (
        3,
        'Thu Hoạch',
        '✋',
        'Thu hoạch con nhộng trùng thảo đúng thời điểm hàm lượng Cordycepin đạt cao nhất. Kiểm tra chất lượng từng lô hàng.',
        '1-2 ngày',
        3
    ),
    (
        4,
        'Sấy Khô & Nghiền',
        '🌀',
        'Sấy lạnh (freeze-dry) để giữ nguyên dưỡng chất. Nghiền mịn thành bột với kích thước hạt đồng đều, tăng khả năng hấp thu.',
        '3-5 ngày',
        4
    ),
    (
        5,
        'Đóng Viên Nang',
        '💊',
        'Đóng bột vào viên nang thực vật (HPMC) bằng máy tự động. Mỗi viên chứa chính xác 500mg bột nhộng trùng thảo nguyên chất.',
        '1 ngày',
        5
    ),
    (
        6,
        'Kiểm Nghiệm & Đóng Gói',
        '✅',
        'Kiểm nghiệm hàm lượng Cordycepin, Adenosine, vi sinh vật tại phòng thí nghiệm độc lập. Đóng gói hút chân không, tem chống giả.',
        '2-3 ngày',
        6
    );
-- Affiliate Tiers
INSERT INTO affiliate_tiers (
        id,
        name,
        icon,
        min_sales,
        max_sales,
        commission,
        color,
        gradient,
        perks,
        sort_order
    )
VALUES (
        'silver',
        'Bạc',
        '🥈',
        1,
        10,
        10,
        '#c0c0c0',
        'linear-gradient(135deg, #c0c0c0, #8a8a8a)',
        ARRAY ['Chiết khấu 10% trên mỗi sản phẩm bán được', 'Hỗ trợ tư vấn bán hàng từ đội ngũ', 'Tài liệu marketing cơ bản'],
        1
    ),
    (
        'gold',
        'Vàng',
        '🥇',
        11,
        30,
        15,
        '#d4a853',
        'linear-gradient(135deg, #d4a853, #b8860b)',
        ARRAY ['Chiết khấu 15% trên mỗi sản phẩm bán được', 'Landing page cá nhân', 'Ưu tiên nhận hàng đợt mới', 'Thưởng thêm khi đạt target tháng'],
        2
    ),
    (
        'diamond',
        'Kim Cương',
        '💎',
        31,
        50,
        20,
        '#00d4ff',
        'linear-gradient(135deg, #00d4ff, #0088cc)',
        ARRAY ['Chiết khấu 20% trên mỗi sản phẩm bán được', 'Hỗ trợ quảng cáo trực tuyến', 'Tham gia đào tạo nâng cao', 'Thưởng bonus quý', 'Mã giảm giá độc quyền cho khách hàng'],
        3
    ),
    (
        'master',
        'Đại Lý',
        '👑',
        51,
        NULL,
        25,
        '#ff6b35',
        'linear-gradient(135deg, #ff6b35, #cc4400)',
        ARRAY ['Chiết khấu 25% trên mỗi sản phẩm bán được', 'Quyền phân phối khu vực', 'Đào tạo 1:1 với đội ngũ lãnh đạo', 'Thưởng doanh số không giới hạn', 'Tham dự sự kiện & hội nghị đặc biệt', 'Hoa hồng cấp 2 từ CTV bạn giới thiệu'],
        4
    );
-- Affiliate Steps (How It Works)
INSERT INTO affiliate_steps (step, title, description, sort_order)
VALUES (
        1,
        'Đăng Ký',
        'Điền form đăng ký CTV, nhận phê duyệt trong 24h',
        1
    ),
    (
        2,
        'Nhận Link',
        'Nhận link giới thiệu & mã CTV cá nhân',
        2
    ),
    (
        3,
        'Chia Sẻ',
        'Giới thiệu sản phẩm đến bạn bè, người thân',
        3
    ),
    (
        4,
        'Nhận Chiết Khấu',
        'Chiết khấu được thanh toán vào cuối mỗi tuần',
        4
    );
-- ===================================
-- ROW LEVEL SECURITY (Public read)
-- ===================================
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_benefits ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE process_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliate_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliate_steps ENABLE ROW LEVEL SECURITY;
-- Allow public read access
CREATE POLICY "Public read products" ON products FOR
SELECT USING (true);
CREATE POLICY "Public read benefits" ON product_benefits FOR
SELECT USING (true);
CREATE POLICY "Public read testimonials" ON testimonials FOR
SELECT USING (true);
CREATE POLICY "Public read process_steps" ON process_steps FOR
SELECT USING (true);
CREATE POLICY "Public read affiliate_tiers" ON affiliate_tiers FOR
SELECT USING (true);
CREATE POLICY "Public read affiliate_steps" ON affiliate_steps FOR
SELECT USING (true);