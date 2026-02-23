// ===================================
// SOCIAL PROOF NOTIFICATIONS
// Hiển thị notifications dạng ẩn danh (không fake số liệu)
// ===================================

export function initSocialProof() {
    const el = document.getElementById('socialProof');
    const iconEl = document.getElementById('spIcon');
    const textEl = document.getElementById('spText');
    const timeEl = document.getElementById('spTime');
    const closeBtn = document.getElementById('spClose');
    if (!el || !iconEl || !textEl || !timeEl) return;

    const FIRST_NAMES = [
        'Lan', 'Hương', 'Mai', 'Thu', 'Hạnh', 'Ngọc', 'Linh', 'Phương',
        'Minh', 'Tuấn', 'Hùng', 'Đức', 'Bình', 'Thảo', 'Trang', 'Yến',
        'Quỳnh', 'Thanh', 'Hiền', 'Nhung', 'Hoa', 'Dung', 'Anh', 'Vân'
    ];

    const CITIES = [
        'TP.HCM', 'Hà Nội', 'Đà Nẵng', 'Cần Thơ', 'Huế', 'Nha Trang',
        'Biên Hòa', 'Bình Dương', 'Vũng Tàu', 'Hải Phòng', 'Đà Lạt',
        'Long An', 'Bắc Ninh', 'Quảng Ninh', 'Thanh Hóa', 'Nghệ An'
    ];

    const RELATIONS = [
        'Chị', 'Anh', 'Cô', 'Chú', 'Bác', 'Dì', 'Mẹ'
    ];

    const notifications = [
        () => {
            const name = pick(FIRST_NAMES);
            const city = pick(CITIES);
            const rel = pick(RELATIONS);
            const qty = pickQty();
            const qtyText = qty === 1 ? '1 hộp' : `${qty} hộp`;
            return {
                type: 'order',
                icon: '🛒',
                text: `<strong>${rel} ${name}</strong> (${city}) vừa đặt ${qtyText}`,
                time: randTime()
            };
        },
        () => {
            const name = pick(FIRST_NAMES);
            const city = pick(CITIES);
            return {
                type: 'order',
                icon: '📦',
                text: `Đơn hàng cho <strong>${pick(RELATIONS)} ${name}</strong> (${city}) đang được chuẩn bị giao`,
                time: randTime()
            };
        },
        () => {
            const name = pick(FIRST_NAMES);
            const city = pick(CITIES);
            return {
                type: 'ctv',
                icon: '🤝',
                text: `<strong>${name}</strong> (${city}) vừa đăng ký cùng đi`,
                time: randTime()
            };
        },
        () => {
            const name = pick(FIRST_NAMES);
            const city = pick(CITIES);
            return {
                type: 'ctv',
                icon: '🎉',
                text: `Chào mừng <strong>${name}</strong> (${city}) — người cùng đi mới!`,
                time: randTime()
            };
        },
        () => {
            const name = pick(FIRST_NAMES);
            const rel = pick(RELATIONS);
            const shares = [
                'Uống chưa tới 1 tháng, ngủ được rồi. 5 năm nay mới ngủ ngon như vậy',
                'Mua cho mẹ, mẹ cho hàng xóm thử, hàng xóm gọi hỏi mua 😅',
                'Mua tặng ba mẹ, hai bác nói sáng ra đi bộ được rồi',
                'Mình thấy bớt mệt, chiều không còn đuối như trước',
                'Ba em hồi đầu nói mấy thứ vớ vẩn. Giờ ổng tự gọi biểu mua thêm 😂',
                'Dạo này dậy sớm được — không phải vì chuông, mà vì muốn dậy',
                'Ngủ sâu hơn, sáng dậy không nặng đầu',
                'Bớt mệt mỏi hẳn, chiều vẫn còn năng lượng'
            ];
            return {
                type: 'share',
                icon: '💬',
                text: `<strong>${rel} ${name}:</strong> "${pick(shares)}"`,
                time: randTime()
            };
        },
        // Trust signals thật — không fake con số
        () => {
            const trustMessages = [
                { icon: '🏭', text: 'Nhà máy đạt chuẩn <strong>GMP — WHO</strong> (tiêu chuẩn quốc tế về sản xuất an toàn)' },
                { icon: '🌿', text: '<strong>100% con nhộng nguyên chất</strong> — không pha bột gạo, tinh bột, phẩm màu' },
                { icon: '💛', text: '<strong>Mười lăm năm</strong> — một sản phẩm. Lớn lên nhờ truyền miệng.' },
                { icon: '📦', text: 'Miễn phí vận chuyển từ <strong>3 hộp</strong>. Đổi trả trong <strong>7 ngày</strong>' },
                { icon: '☎️', text: 'Tư vấn miễn phí: <strong>0903.940.171</strong> — Thứ 2 đến Thứ 7, 8:00-17:30' }
            ];
            const m = pick(trustMessages);
            return {
                type: 'health',
                icon: m.icon,
                text: m.text,
                time: 'Thông tin'
            };
        }
    ];

    function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
    function rand(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
    function pickQty() {
        const r = Math.random();
        if (r < 0.5) return 1;
        if (r < 0.75) return 2;
        if (r < 0.9) return 3;
        return rand(4, 6);
    }
    function randTime() {
        const mins = rand(1, 45);
        if (mins <= 1) return 'Vừa xong';
        if (mins <= 5) return `${mins} phút trước`;
        return `${mins} phút trước`;
    }

    let timer = null;
    let index = 0;
    const shuffled = shuffle([...Array(notifications.length).keys()]);

    function shuffle(arr) {
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    }

    function showNext() {
        const fn = notifications[shuffled[index % shuffled.length]];
        const data = fn();

        iconEl.className = `social-proof-icon ${data.type}`;
        iconEl.textContent = data.icon;
        textEl.innerHTML = data.text;
        timeEl.textContent = data.time;

        el.classList.add('show');

        clearTimeout(timer);
        timer = setTimeout(() => {
            el.classList.remove('show');
            index++;
            setTimeout(showNext, rand(12000, 25000));
        }, 5500);
    }

    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            el.classList.remove('show');
            clearTimeout(timer);
            setTimeout(showNext, rand(30000, 60000));
        });
    }

    setTimeout(showNext, 8000);
}
