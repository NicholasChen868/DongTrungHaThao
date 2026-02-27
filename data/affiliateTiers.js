export const affiliateTiers = [
    {
        id: 'silver',
        name: 'Bạc',
        icon: '🥈',
        minSales: 1,
        maxSales: 15,
        commission: 10,
        color: '#c0c0c0',
        gradient: 'linear-gradient(135deg, #c0c0c0, #8a8a8a)',
        perks: [
            '10% mỗi hộp giới thiệu thành công = 145.000₫/hộp',
            'Đội ngũ hỗ trợ 1:1 — luôn đồng hành cùng bạn',
            'Tài liệu sản phẩm đầy đủ để tự tin chia sẻ',
        ],
    },
    {
        id: 'gold',
        name: 'Vàng',
        icon: '🥇',
        minSales: 16,
        maxSales: 40,
        commission: 15,
        color: '#d4a853',
        gradient: 'linear-gradient(135deg, #d4a853, #b8860b)',
        perks: [
            '15% = 217.500₫/hộp — ghi nhận sự nỗ lực của bạn',
            'Trang giới thiệu cá nhân mang tên bạn',
            'Ưu tiên nhận hàng lô mới',
            'Thưởng khi đạt target tháng',
        ],
    },
    {
        id: 'vip',
        name: 'VIP',
        icon: '💎',
        minSales: 41,
        maxSales: null,
        commission: 22,
        color: '#00d4ff',
        gradient: 'linear-gradient(135deg, #00d4ff, #0088cc)',
        perks: [
            '22% = 319.000₫/hộp — mức cao nhất',
            'Quyền phân phối khu vực — xây dựng đội nhóm riêng',
            'Đào tạo 1:1 với người sáng lập',
            'Hoa hồng cấp 2 từ CTV bạn giới thiệu',
            'Mã ưu đãi riêng tặng khách hàng của bạn',
        ],
    },
];

export const affiliateProgram = {
    title: 'Chương Trình Cộng Tác Viên',
    subtitle: 'Chia sẻ sức khỏe, nhận thu nhập cùng nhau.',
    description: 'Bạn giới thiệu sản phẩm cho người bạn tin là cần — chúng tôi lo đóng gói, giao hàng, chăm sóc khách hàng. Mỗi đơn thành công, bạn nhận chiết khấu xứng đáng. Cùng nhau lan tỏa sức khỏe, cùng nhau tạo thu nhập bền vững.',
    howItWorks: [
        { step: 1, title: 'Đăng Ký', desc: 'Điền form đơn giản, duyệt trong 24 giờ. Hoàn toàn miễn phí.' },
        { step: 2, title: 'Nhận Mã', desc: 'Mã CTV riêng và link giới thiệu chỉ dành cho bạn.' },
        { step: 3, title: 'Chia Sẻ', desc: 'Gửi đến người bạn quan tâm — qua Zalo, Facebook, hay gặp mặt trực tiếp.' },
        { step: 4, title: 'Nhận Thu Nhập', desc: 'Đơn thành công, chiết khấu vào tài khoản. Thanh toán cuối tuần.' },
    ],
};
