-- ===================================
-- V3 Promotions: Update existing + Seed 3 seasonal
-- RUN THIS IN SUPABASE SQL EDITOR (Dashboard)
-- ===================================
-- 1. CẬP NHẬT promotion Bứt Phá Đinh Ngọ — bỏ emoji, V3 tone
UPDATE promotions
SET tagline = 'Biến áp lực thành cơ hội tỏa sáng',
        icon = '★',
        story_html = 'Bạn ơi, còn nhớ bao nhiêu thứ hẹn <em>"qua Tết đi..."</em> không?<br><br>Tết đã qua rồi — mà deadline thì đang <strong>dí tới mặt</strong>. Cuối năm tồn đọng, đầu năm ngập đầu. Mệt. Đuối. Muốn bỏ cuộc.<br><br>Nhưng khoan... <strong>tại sao không biến áp lực này thành cơ hội để tỏa sáng?</strong><br><br>Đang "đuối đuối" → uống <strong>2 viên Đông Trùng</strong> → <em>khỏe re, chạy tới đêm không mệt</em>. Người ta hỏi bí quyết gì mà năng lượng đầy — bạn chỉ cười.',
        benefits = '[{"icon": "·", "text": "Tỉnh táo, minh mẫn — <em>không phải cà phê</em>"}, {"icon": "·", "text": "Làm xuyên đêm mà sáng vẫn tươi"}, {"icon": "·", "text": "Tăng đề kháng — mùa nắng mưa thất thường"}, {"icon": "·", "text": "Giảm <strong>5%</strong> khi đặt trước <strong>28/02/2026</strong>"}]'::jsonb,
        cta_text = '2 viên/ngày — Khỏe re!',
        footer_quote = '"Đừng để sức ì sau Tết là lý do bạn bỏ lỡ cơ hội đầu năm."',
        updated_at = now()
WHERE title = 'Bứt Phá Đầu Năm Đinh Ngọ';
-- 2. SEED: 8/3 — Quốc Tế Phụ Nữ (Giảm 8%)
INSERT INTO promotions (
                title,
                program_name,
                tagline,
                icon,
                discount_percent,
                badge_text,
                story_html,
                benefits,
                cta_text,
                cta_note,
                footer_quote,
                starts_at,
                ends_at,
                is_active,
                priority
        )
VALUES (
                '8/3 — Tặng Mẹ Sức Khỏe, Đừng Chỉ Tặng Hoa',
                'Yêu Thương 8/3',
                'Hoa héo sau 3 ngày. Sức khỏe ở lại mỗi ngày.',
                '✿',
                8,
                'GIẢM 8%',
                'Mẹ hay nói <em>"mẹ khỏe mà, con lo gì."</em><br><br>Vợ cũng vậy — sáng lo con đi học, tối lo cơm nước, khuya còn dọn nhà. Hỏi thì cười: <em>"Có gì đâu."</em><br><br>Nhưng bạn biết mà. Mẹ giấu mệt giỏi lắm.<br><br>8/3 — hoa đẹp nhưng héo sau 3 ngày. Có một món quà <strong>ở lại lâu hơn</strong>: sức khỏe.<br><br>2 viên Đông Trùng mỗi sáng — nhiều người chia sẻ rằng <strong>giấc ngủ sâu hơn, sáng dậy nhẹ hơn, da dẻ hồng hào hơn</strong>. Tặng mẹ, tặng vợ, tặng chị em — hay tặng chính mình cũng được.',
                '[{"icon": "·", "text": "Giảm 8% nhân ngày 8/3 — áp dụng mọi đơn hàng"}, {"icon": "·", "text": "Nhiều chị em chia sẻ: ngủ ngon hơn, da sáng hơn, ít mệt hơn"}, {"icon": "·", "text": "Tặng thiệp viết tay khi ghi chú tặng mẹ / tặng vợ"}, {"icon": "·", "text": "Áp dụng 01/03 → 10/03/2026"}]'::jsonb,
                'Đặt Tặng Mẹ — Giao Trước 8/3',
                'Đặt trước 06/03 để nhận hàng kịp 8/3',
                '"Yêu thương không cần dịp — nhưng 8/3 là dịp để nói ra."',
                '2026-03-01 00:00:00+07',
                '2026-03-10 23:59:59+07',
                false,
                10
        );
-- 3. SEED: Mùa Thi (Giảm 5%)
INSERT INTO promotions (
                title,
                program_name,
                tagline,
                icon,
                discount_percent,
                badge_text,
                story_html,
                benefits,
                cta_text,
                cta_note,
                footer_quote,
                starts_at,
                ends_at,
                is_active,
                priority
        )
VALUES (
                'Mùa Thi — Cả Nhà Cần Thêm Sức',
                'Bứt Phá Mùa Thi',
                'Con ôn bài tới khuya, ba mẹ thức cùng — ai cũng cần nghỉ ngơi đủ.',
                '✎',
                5,
                'GIẢM 5%',
                'Con ôn bài tới 1-2h sáng. Mắt díp mà sách còn dày. Ba mẹ thì thức cùng — muốn giúp mà không biết giúp kiểu gì ngoài nấu cháo đêm.<br><br>Nhiều phụ huynh chia sẻ: cho con uống Đông Trùng trong mùa thi, thấy con <em>ngủ ngon hơn, sáng dậy nhẹ nhàng, ít mệt mỏi khi học</em>. Không phải thần dược — mà là <strong>bồi bổ đúng lúc, đúng cách</strong>.<br><br>Ba mẹ cũng đừng quên chăm mình — thức cùng con mỗi đêm, cơ thể cũng cần được nghỉ ngơi đúng cách.',
                '[{"icon": "·", "text": "Hỗ trợ giấc ngủ sâu — dậy sáng tỉnh táo, học tập hiệu quả hơn"}, {"icon": "·", "text": "Tăng đề kháng mùa thi — ít ốm vặt, không mất ngày ôn"}, {"icon": "·", "text": "Mua 2 hộp trở lên — giảm thêm 2% cho cả gia đình"}, {"icon": "·", "text": "Áp dụng 15/04 → 31/05/2026"}]'::jsonb,
                'Mua Cho Con Học Thi',
                'Đông Trùng là thực phẩm bổ sung, không thay thế thuốc điều trị',
                '"Không có đường tắt — nhưng có cách để đi xa mà không kiệt sức."',
                '2026-04-15 00:00:00+07',
                '2026-05-31 23:59:59+07',
                false,
                8
        );
-- 4. SEED: Vu Lan (Giảm 10%)
INSERT INTO promotions (
                title,
                program_name,
                tagline,
                icon,
                discount_percent,
                badge_text,
                story_html,
                benefits,
                cta_text,
                cta_note,
                footer_quote,
                starts_at,
                ends_at,
                is_active,
                priority
        )
VALUES (
                'Vu Lan — Mua Tặng Ba Mẹ, Giao Tận Nhà',
                'Hiếu Kính Vu Lan',
                'Hiếu kính không chỉ nói — mà là chăm ba mẹ mỗi ngày.',
                '❀',
                10,
                'GIẢM 10%',
                'Ba mẹ già đi mỗi ngày — mà mình bận quá, đôi khi quên mất.<br><br>Gọi điện thì ba nói <em>"ba khỏe"</em>, mẹ nói <em>"mẹ ổn."</em> Nhưng bạn có thấy <strong>tóc ba bạc thêm, mẹ hay kêu mỏi lưng</strong> không?<br><br>Vu Lan không cần quà đắt tiền. Chỉ cần cho ba mẹ biết: <strong>"Con quan tâm sức khỏe ba mẹ thật sự."</strong><br><br>2 viên mỗi sáng — nhiều người chia sẻ rằng sau 2-3 tuần, ba mẹ họ <strong>ngủ ngon hơn, ít mệt mỏi, khỏe khoắn hơn</strong>. Món quà nhỏ — nhưng ở lại với ba mẹ mỗi ngày.',
                '[{"icon": "·", "text": "Giảm 10% nhân mùa Vu Lan — tri ân cha mẹ"}, {"icon": "·", "text": "Tặng kèm túi quà Vu Lan khi ghi chú tặng ba mẹ"}, {"icon": "·", "text": "Giao tận nhà ba mẹ — ghi địa chỉ khi đặt, chúng tôi lo"}, {"icon": "·", "text": "Áp dụng 01/07 → 20/08/2026"}]'::jsonb,
                'Mua Tặng Ba Mẹ',
                'Ghi địa chỉ ba mẹ khi đặt — chúng tôi giao tận nơi',
                '"Cây có gốc mới nở hoa — người có cha mẹ mới nên ta có ngày hôm nay."',
                '2026-07-01 00:00:00+07',
                '2026-08-20 23:59:59+07',
                false,
                10
        );