-- ===================================
-- AG-15: Seed promotions — 3 upcoming seasonal promotions
-- Dùng với bảng promotions đã tạo ở migration 021
-- ===================================
-- 1. Quốc Tế Phụ Nữ 8/3 — Tặng Mẹ, Tặng Vợ
INSERT INTO promotions (
        name,
        slug,
        tagline,
        description,
        discount_percent,
        discount_type,
        start_date,
        end_date,
        is_active,
        priority,
        badge_text,
        story_title,
        story_content,
        benefits,
        cta_text,
        cta_note
    )
VALUES (
        'Yêu Thương Dành Cho Mẹ',
        'yeu-thuong-danh-cho-me-8-3',
        'Quà sức khỏe — ý nghĩa hơn hoa 🌸',
        'Nhân ngày 8/3, tặng mẹ, tặng vợ, tặng bà — một món quà bồi đắp sức khỏe mỗi ngày. Vì những người phụ nữ trong đời mình xứng đáng được chăm sóc nhiều hơn.',
        5,
        'percent',
        '2026-03-01',
        '2026-03-10',
        false,
        10,
        'GIẢM 5%',
        'Chương trình Yêu Thương Dành Cho Mẹ',
        'Bạn ơi, 8/3 năm nay — thay vì bó hoa héo sau 3 ngày, hãy tặng mẹ một điều bền lâu hơn 🌸

Mẹ hay nói "không cần gì" — nhưng mẹ cần được nghỉ ngơi, cần ngủ ngon, cần bớt mệt. 2 viên mỗi sáng — nhỏ thôi, nhưng đủ để mẹ biết con nhớ.',
        '[{"icon": "🌸", "text": "Quà sức khỏe — ý nghĩa hơn hoa"}, {"icon": "💤", "text": "Nhiều mẹ chia sẻ: ngủ ngon hơn sau 2 tuần"}, {"icon": "🛡️", "text": "Tăng đề kháng — chăm sóc mỗi ngày"}, {"icon": "⏳", "text": "Giảm 5% khi đặt trước 10/03/2026"}]',
        'Tặng Mẹ — Giảm 5% Hôm Nay',
        '*Tự động giảm 5% khi đặt hàng. Giao nhanh trong 2h tại TP.HCM.'
    );
-- 2. Mùa Thi — Năng Lượng Cho Con
INSERT INTO promotions (
        name,
        slug,
        tagline,
        description,
        discount_percent,
        discount_type,
        start_date,
        end_date,
        is_active,
        priority,
        badge_text,
        story_title,
        story_content,
        benefits,
        cta_text,
        cta_note
    )
VALUES (
        'Năng Lượng Mùa Thi',
        'nang-luong-mua-thi',
        'Tỉnh táo hơn, nhớ lâu hơn, ngủ sâu hơn 📚',
        'Mùa thi cử — con ôn bài đến khuya, sáng dậy mệt. Đông Trùng Hạ Thảo giúp cải thiện giấc ngủ sâu, tỉnh táo hơn ban ngày. Không phải thuốc thần — nhưng là đồng minh mỗi ngày.',
        3,
        'percent',
        '2026-05-15',
        '2026-07-05',
        false,
        8,
        'GIẢM 3%',
        'Chương trình Năng Lượng Mùa Thi',
        'Mùa thi đến — con ôn bài đến 1-2h sáng, sáng dậy mắt thâm, đầu nặng 📚

Cà phê giúp tỉnh tạm — nhưng không giúp ngủ sâu. Đông Trùng Hạ Thảo làm điều khác: Adenosine cải thiện giấc ngủ sâu → tỉnh táo hơn → ghi nhớ tốt hơn. Từ từ, mỗi ngày một chút.',
        '[{"icon": "📚", "text": "Tỉnh táo hơn — ghi nhớ tốt hơn"}, {"icon": "💤", "text": "Ngủ sâu hơn — dù ôn bài khuya"}, {"icon": "💪", "text": "Ít mệt mỏi — năng lượng bền cả ngày"}, {"icon": "⏳", "text": "Giảm 3% khi đặt trước 05/07/2026"}]',
        'Đặt Thử — Giảm 3% Mùa Thi',
        '*Chương trình cho học sinh, sinh viên. Giao tận nhà.'
    );
-- 3. Vu Lan Báo Hiếu — Tặng Ba Mẹ
INSERT INTO promotions (
        name,
        slug,
        tagline,
        description,
        discount_percent,
        discount_type,
        start_date,
        end_date,
        is_active,
        priority,
        badge_text,
        story_title,
        story_content,
        benefits,
        cta_text,
        cta_note
    )
VALUES (
        'Vu Lan Báo Hiếu',
        'vu-lan-bao-hieu',
        'Tặng ba mẹ — vì ba mẹ xứng đáng 💛',
        'Vu Lan là dịp để nhớ về ba mẹ. Thay vì nói "con thương ba mẹ" — hãy tặng ba mẹ điều gì đó chăm sóc sức khỏe mỗi ngày.',
        5,
        'percent',
        '2026-08-10',
        '2026-08-25',
        false,
        10,
        'GIẢM 5%',
        'Chương trình Vu Lan Báo Hiếu',
        'Vu Lan — ngày mà ai cũng nhớ về ba mẹ.

Nhưng ba mẹ không cần nghe "con thương ba mẹ" — ba mẹ cần được chăm sóc mỗi ngày. Một viên nang mỗi sáng — nhỏ thôi, nhưng đủ để ba mẹ biết con nhớ 💛

Năm nay, thay vì chỉ gọi điện — hãy gửi kèm một hộp.',
        '[{"icon": "💛", "text": "Tặng ba mẹ — vì ba mẹ xứng đáng"}, {"icon": "🌿", "text": "100% nguyên chất — an tâm cho người lớn tuổi"}, {"icon": "🛡️", "text": "Bồi đắp đề kháng — mỗi ngày một chút"}, {"icon": "⏳", "text": "Giảm 5% nhân dịp Vu Lan 2026"}]',
        'Tặng Ba Mẹ — Giảm 5%',
        '*Chọn option "Gửi như quà tặng" để thêm lời nhắn. Giao tận nhà.'
    );