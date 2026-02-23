-- ===================================
-- AG-12: Seed testimonials — segment "người con mua cho ba mẹ"
-- Data nói: 35-40% người mua ĐTHT = con cái mua cho cha mẹ
-- ===================================
-- Xem structure hiện tại
-- testimonials(id, author_name, author_info, avatar_url, content, rating, is_featured, display_order, created_at)
-- Thêm 2 testimonials từ góc nhìn "người con"
INSERT INTO testimonials (
        author_name,
        author_info,
        content,
        rating,
        is_featured,
        display_order
    )
VALUES (
        'Minh Anh',
        'Con gái, mua tặng Ba Mẹ — TP.HCM',
        'Ba mẹ em đều ngoài 60. Ba đi bộ buổi sáng mà mau mệt, mẹ thì ngủ chập chờn. Em mua 1 hộp cho ba mẹ dùng thử, không kỳ vọng gì nhiều. Tháng đầu ba nói "chưa thấy gì". Nhưng qua tháng thứ 2, mẹ gọi: "Dạo này mẹ ngủ được rồi con ơi." Ba thì không nói, nhưng hàng xóm kể "ông đi bộ xa hơn rồi đó." Giờ em đặt lại mỗi 2 tháng. Không phải vì tin quảng cáo — mà vì mẹ ngủ ngon, ba khỏe re, là đủ.',
        5,
        true,
        20
    ),
    (
        'Thanh Phong',
        'Con trai, tặng Ba nhân ngày Bố — Đà Nẵng',
        'Ngày Bố năm ngoái, em không biết mua gì. Ba em khó tính lắm, cho gì cũng nói "tiền mắc, không cần." Em liều mua 1 hộp Đông Trùng Hạ Thảo. Ba nhìn giá, cằn nhằn. Nhưng rồi ổng uống. Uống hết hộp. Rồi hỏi: "Thằng, còn hộp nào không?" 😅 Bây giờ mỗi tháng ba gọi biểu mua thêm. Đó là lời khen lớn nhất từ ba em rồi.',
        5,
        true,
        21
    );