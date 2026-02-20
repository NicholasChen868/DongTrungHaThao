// ===================================
// NGŨ HÀNH (Five Elements) Analysis
// Pure JS — No API needed
// ===================================

const THIEN_CAN = [
    { can: 'Canh', hanh: 'Kim',  amDuong: 'Dương' },  // 0
    { can: 'Tân',  hanh: 'Kim',  amDuong: 'Âm' },     // 1
    { can: 'Nhâm', hanh: 'Thủy', amDuong: 'Dương' },  // 2
    { can: 'Quý',  hanh: 'Thủy', amDuong: 'Âm' },     // 3
    { can: 'Giáp', hanh: 'Mộc',  amDuong: 'Dương' },  // 4
    { can: 'Ất',   hanh: 'Mộc',  amDuong: 'Âm' },     // 5
    { can: 'Bính', hanh: 'Hỏa',  amDuong: 'Dương' },  // 6
    { can: 'Đinh', hanh: 'Hỏa',  amDuong: 'Âm' },     // 7
    { can: 'Mậu',  hanh: 'Thổ',  amDuong: 'Dương' },  // 8
    { can: 'Kỷ',   hanh: 'Thổ',  amDuong: 'Âm' },     // 9
];

const DIA_CHI = [
    { name: 'Tý',   con: 'Chuột' },
    { name: 'Sửu',  con: 'Trâu' },
    { name: 'Dần',  con: 'Hổ' },
    { name: 'Mão',  con: 'Mèo' },
    { name: 'Thìn', con: 'Rồng' },
    { name: 'Tỵ',   con: 'Rắn' },
    { name: 'Ngọ',  con: 'Ngựa' },
    { name: 'Mùi',  con: 'Dê' },
    { name: 'Thân', con: 'Khỉ' },
    { name: 'Dậu',  con: 'Gà' },
    { name: 'Tuất', con: 'Chó' },
    { name: 'Hợi',  con: 'Heo' },
];

const ELEMENT_DATA = {
    Kim: {
        icon: '🥇',
        colorHex: '#C0C0C0',
        colorGradient: 'linear-gradient(135deg, #C0C0C0, #E8E8E8)',
        organ: 'Phổi & Đường hô hấp',
        organIcon: '🫁',
        weakness: 'Dễ mắc các bệnh về phổi, viêm phế quản, hen suyễn, da khô',
        strength: 'Ý chí mạnh mẽ, quyết đoán, công bằng',
        healthAdvice: 'Đông Trùng Hạ Thảo đặc biệt phù hợp với mệnh Kim vì cordycepin trong Đông Trùng có tác dụng bảo vệ phổi, tăng cường chức năng hô hấp và nâng cao sức đề kháng.',
        recommendation: 'Uống 2 viên/ngày sau bữa sáng. Kết hợp tập thở sâu 10 phút mỗi sáng.',
        dietTip: 'Nên ăn nhiều thực phẩm trắng: lê, củ cải, bạch quả, yến mạch',
        compatible: ['Thổ', 'Thủy'],
        conflicting: ['Hỏa'],
        season: 'Mùa Thu — thời điểm phổi cần được bảo vệ nhất',
    },
    Thủy: {
        icon: '💧',
        colorHex: '#1E90FF',
        colorGradient: 'linear-gradient(135deg, #1E90FF, #00CED1)',
        organ: 'Thận & Hệ tiết niệu',
        organIcon: '🫘',
        weakness: 'Dễ đau lưng, tiểu đêm, suy giảm sinh lực, phù nề',
        strength: 'Trí tuệ sâu sắc, linh hoạt, sáng tạo',
        healthAdvice: 'Đông Trùng Hạ Thảo là "thần dược" cho mệnh Thủy — giúp bổ thận tráng dương, tăng cường chức năng thận và cải thiện sinh lực toàn diện.',
        recommendation: 'Uống 2 viên/ngày trước bữa ăn 30 phút. Uống đủ 2 lít nước/ngày.',
        dietTip: 'Nên ăn thực phẩm đen: đậu đen, mè đen, nấm hương, hạt óc chó',
        compatible: ['Kim', 'Mộc'],
        conflicting: ['Thổ'],
        season: 'Mùa Đông — thời điểm thận dễ suy yếu nhất',
    },
    Mộc: {
        icon: '🌿',
        colorHex: '#228B22',
        colorGradient: 'linear-gradient(135deg, #228B22, #32CD32)',
        organ: 'Gan & Mắt',
        organIcon: '🫀',
        weakness: 'Dễ nóng gan, mắt mờ, đau đầu, căng thẳng, mất ngủ',
        strength: 'Nhân hậu, bao dung, năng động, phát triển',
        healthAdvice: 'Đông Trùng Hạ Thảo hỗ trợ giải độc gan, bảo vệ tế bào gan và cải thiện thị lực. Cordyceps giúp giảm viêm gan và tăng cường chức năng gan.',
        recommendation: 'Uống 2 viên/ngày sau bữa tối. Hạn chế rượu bia, ngủ trước 23h.',
        dietTip: 'Nên ăn thực phẩm xanh: rau bina, bông cải xanh, trà xanh, bưởi',
        compatible: ['Thủy', 'Hỏa'],
        conflicting: ['Kim'],
        season: 'Mùa Xuân — gan hoạt động mạnh, cần được hỗ trợ',
    },
    Hỏa: {
        icon: '🔥',
        colorHex: '#FF4500',
        colorGradient: 'linear-gradient(135deg, #FF4500, #FF6347)',
        organ: 'Tim & Huyết áp',
        organIcon: '❤️',
        weakness: 'Dễ huyết áp cao, tim đập nhanh, mất ngủ, nóng trong',
        strength: 'Nhiệt huyết, lạc quan, lãnh đạo, truyền cảm hứng',
        healthAdvice: 'Đông Trùng Hạ Thảo giúp ổn định huyết áp, tăng cường tuần hoàn máu và bảo vệ tim mạch. Adenosine trong đông trùng có tác dụng an thần tự nhiên.',
        recommendation: 'Uống 1-2 viên/ngày sau bữa trưa. Tập yoga hoặc thiền 15 phút/ngày.',
        dietTip: 'Nên ăn thực phẩm đỏ: cà chua, dưa hấu, gấc, táo đỏ, kỷ tử',
        compatible: ['Mộc', 'Thổ'],
        conflicting: ['Thủy'],
        season: 'Mùa Hè — tim làm việc nhiều, cần được chăm sóc',
    },
    Thổ: {
        icon: '🏔️',
        colorHex: '#DAA520',
        colorGradient: 'linear-gradient(135deg, #DAA520, #B8860B)',
        organ: 'Dạ dày & Tỳ vị',
        organIcon: '🫃',
        weakness: 'Dễ đầy bụng, khó tiêu, chán ăn, thiếu máu, mệt mỏi',
        strength: 'Trung thực, đáng tin cậy, chăm chỉ, ổn định',
        healthAdvice: 'Đông Trùng Hạ Thảo tăng cường hấp thu dinh dưỡng, cải thiện hệ tiêu hóa và bổ sung năng lượng. Polysaccharides trong đông trùng nuôi dưỡng hệ vi sinh đường ruột.',
        recommendation: 'Uống 2 viên/ngày trước bữa ăn sáng. Ăn chậm, nhai kỹ.',
        dietTip: 'Nên ăn thực phẩm vàng: nghệ, bí đỏ, khoai lang, ngô, mật ong',
        compatible: ['Hỏa', 'Kim'],
        conflicting: ['Mộc'],
        season: 'Giao mùa — lúc tỳ vị dễ rối loạn nhất',
    },
};

/**
 * Analyze Ngũ Hành from birth year
 * @param {number} birthYear - e.g. 1990
 * @returns {Object} Full analysis result
 */
export function analyzeNguHanh(birthYear) {
    const canIndex = birthYear % 10;
    const chiIndex = (birthYear - 4) % 12;
    const chiName = DIA_CHI[chiIndex < 0 ? chiIndex + 12 : chiIndex];

    const { can, hanh } = THIEN_CAN[canIndex];
    const data = ELEMENT_DATA[hanh];

    // Calculate tuổi âm lịch display
    const canChi = `${can} ${chiName}`;

    return {
        birthYear,
        canChi,
        thienCan: can,
        diaChi: chiName,
        element: hanh,
        elementIcon: data.icon,
        colorHex: data.colorHex,
        colorGradient: data.colorGradient,
        organTarget: data.organ,
        organIcon: data.organIcon,
        weakness: data.weakness,
        strength: data.strength,
        healthAdvice: data.healthAdvice,
        recommendation: data.recommendation,
        dietTip: data.dietTip,
        compatibleElements: data.compatible,
        conflictingElements: data.conflicting,
        season: data.season,
    };
}

/**
 * Get all 5 elements summary for radar chart
 */
export function getAllElements() {
    return Object.entries(ELEMENT_DATA).map(([name, data]) => ({
        name,
        icon: data.icon,
        color: data.colorHex,
        organ: data.organ,
    }));
}
