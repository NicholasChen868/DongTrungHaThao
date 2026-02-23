// ===================================
// SOCIAL PROOF NOTIFICATIONS
// Fake realtime: đơn hàng, CTV mới, chia sẻ...
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
                text: `<strong>${name}</strong> (${city}) vừa trở thành Cộng Tác Viên`,
                time: randTime()
            };
        },
        () => {
            const name = pick(FIRST_NAMES);
            return {
                type: 'ctv',
                icon: '🎉',
                text: `Chào mừng CTV <strong>${name}</strong> gia nhập đại gia đình!`,
                time: randTime()
            };
        },
        () => {
            const name = pick(FIRST_NAMES);
            const rel = pick(RELATIONS);
            const shares = [
                'Uống 2 tuần thấy ngủ ngon hẳn',
                'Dùng 1 tháng, cảm giác khỏe hơn rõ rệt',
                'Mua tặng ba mẹ, hai bác rất hài lòng',
                'Đợt này đặt thêm cho cả nhà',
                'Sáng dậy thấy nhẹ nhõm, không còn mệt'
            ];
            return {
                type: 'share',
                icon: '💬',
                text: `<strong>${rel} ${name}:</strong> "${pick(shares)}"`,
                time: randTime()
            };
        },
        () => {
            const milestones = [
                { icon: '🏆', text: `Hôm nay đã có <strong>${rand(80, 200)}+ đơn hàng</strong> được xử lý` },
                { icon: '📈', text: `<strong>${rand(15, 45)} CTV mới</strong> đăng ký trong tuần này` },
                { icon: '💛', text: `Hơn <strong>${rand(2000, 5000)} khách hàng</strong> đã tin dùng sản phẩm` },
                { icon: '⭐', text: `Đánh giá trung bình: <strong>4.${rand(7, 9)}/5</strong> từ khách hàng` }
            ];
            const m = pick(milestones);
            return {
                type: 'health',
                icon: m.icon,
                text: m.text,
                time: 'Vừa cập nhật'
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
