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
        emotionalKey: 'Người mệnh Kim mang vẻ ngoài cứng cỏi nhưng bên trong là trái tim ấm áp, luôn muốn bảo vệ người thân. Khi căng thẳng tích tụ ở vai và ngực, bạn cần được "thở" — thở thật sâu, thở thật chậm. Đông Trùng giúp bạn tìm lại nhịp thở bình yên đó.',
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
        emotionalKey: 'Người mệnh Thủy sâu lắng, nhạy cảm, giàu trực giác — bạn thường cảm nhận được điều người khác chưa nói. Nhưng khi thận yếu, nỗi lo âu len lỏi, cảm giác mất phương hướng ập đến. Đông Trùng giúp "neo" lại năng lượng, mang sự bình an từ bên trong.',
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
        emotionalKey: 'Người mệnh Mộc như cây cổ thụ — sáng tạo, bao dung, luôn vươn lên. Nhưng khi gan nóng, sự bao dung biến thành cáu gắt, tầm nhìn xa trở nên mờ mịt. Đông Trùng giúp "hạ hỏa" nhẹ nhàng, trả lại sự bình tĩnh và cái nhìn rõ ràng cho bạn.',
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
        emotionalKey: 'Người mệnh Hỏa là ngọn lửa sưởi ấm mọi người xung quanh — nhiệt huyết, lạc quan, truyền cảm hứng. Nhưng khi tim mệt, ngọn lửa leo lắt, bạn thấy cô đơn giữa đám đông. Đông Trùng giúp nuôi dưỡng ngọn lửa đều đặn, không bùng cháy rồi tắt lịm.',
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
        emotionalKey: 'Người mệnh Thổ là chỗ dựa vững chãi cho gia đình — chung thủy, đáng tin cậy, luôn hy sinh thầm lặng. Nhưng bạn hay lo lắng cho người khác mà quên chăm sóc chính mình. Đông Trùng nhắc bạn: hãy chăm sóc bản thân trước, để có sức mà lo cho người thương.',
    },
};

/**
 * Analyze Ngũ Hành from birth year
 * @param {number} birthYear - e.g. 1990
 * @returns {Object} Full analysis result
 */
export function analyzeNguHanh(birthYear) {
    const year = Math.floor(Number(birthYear));
    if (!year || year < 1900 || year > 2100) return null;

    const canIndex = year % 10;
    const chiIndex = (year - 4) % 12;
    const chi = DIA_CHI[chiIndex < 0 ? chiIndex + 12 : chiIndex];

    const { can, hanh, amDuong } = THIEN_CAN[canIndex];
    const data = ELEMENT_DATA[hanh];

    return {
        birthYear: year,
        canChi: `${can} ${chi.name}`,
        thienCan: can,
        amDuong,
        diaChi: chi.name,
        conGiap: chi.con,
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
        emotionalKey: data.emotionalKey,
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

/**
 * Tạo lời chào cá nhân dựa trên Ngũ Hành.
 * Dùng cho greeting banner hoặc popup chào đón.
 *
 * @param {string} name - Tên khách hàng
 * @param {number} birthYear - Năm sinh
 * @returns {string} Lời chào cá nhân hóa
 */
export function generateGreeting(name, birthYear) {
    const result = analyzeNguHanh(birthYear);
    if (!result) return `Chào ${name}! Chúc bạn sức khỏe dồi dào.`;

    const greetings = {
        Kim: `Chào ${name}! Người mệnh ${result.elementIcon} Kim như bạn mang năng lượng mạnh mẽ và quyết đoán. Hãy để Đông Trùng Hạ Thảo chăm sóc lá phổi của bạn nhé.`,
        Thủy: `Chào ${name}! Mệnh ${result.elementIcon} Thủy cho bạn sự sâu sắc và trực giác tuyệt vời. Đông Trùng Hạ Thảo — "thần dược bổ thận" — như được sinh ra dành cho bạn.`,
        Mộc: `Chào ${name}! Mệnh ${result.elementIcon} Mộc mang đến sức sống và sáng tạo không ngừng. Đông Trùng Hạ Thảo sẽ giúp lá gan của bạn luôn khỏe mạnh.`,
        Hỏa: `Chào ${name}! Mệnh ${result.elementIcon} Hỏa cho bạn nhiệt huyết và năng lượng lan tỏa. Hãy để Đông Trùng giữ cho trái tim bạn luôn đập đều và khỏe.`,
        Thổ: `Chào ${name}! Mệnh ${result.elementIcon} Thổ cho bạn sự vững chãi, đáng tin cậy. Đông Trùng Hạ Thảo sẽ giúp hệ tiêu hóa của bạn hấp thu trọn vẹn.`,
    };

    return greetings[result.element];
}

/**
 * Tạo "Bản Đồ Sức Khỏe" dạng data object (render-ready, không chứa HTML thô).
 * Dùng cho popup hoặc section hiển thị kết quả phân tích.
 *
 * @param {number} birthYear - Năm sinh
 * @returns {object|null} Dữ liệu render-ready
 */
export function getHealthMap(birthYear) {
    const r = analyzeNguHanh(birthYear);
    if (!r) return null;

    return {
        title: `Bản Đồ Sức Khỏe — Mệnh ${r.element}`,
        icon: r.elementIcon,
        color: r.colorHex,
        gradient: r.colorGradient,
        canChi: `${r.canChi} — Tuổi ${r.conGiap}`,
        amDuong: r.amDuong,
        sections: [
            {
                label: 'Mệnh',
                value: `${r.element} (${r.amDuong})`,
                detail: `${r.canChi} — Tuổi ${r.conGiap}`,
            },
            {
                label: 'Cơ quan cần chăm sóc',
                value: `${r.organIcon} ${r.organTarget}`,
                detail: r.healthAdvice,
            },
            {
                label: 'Điểm yếu cần lưu ý',
                value: r.weakness,
                detail: `Mùa cần chú ý: ${r.season}`,
            },
            {
                label: 'Lời khuyên sử dụng',
                value: r.recommendation,
                detail: `Dinh dưỡng hỗ trợ: ${r.dietTip}`,
            },
            {
                label: 'Tương hợp',
                value: r.compatibleElements.join(' & '),
                detail: `Hành tương khắc: ${r.conflictingElements.join(', ')}`,
            },
            {
                label: 'Thông điệp dành riêng cho bạn',
                value: r.emotionalKey,
                detail: null,
            },
        ],
    };
}
