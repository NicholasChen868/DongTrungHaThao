import { describe, it, expect } from 'vitest';
import { analyzeNguHanh, getAllElements, generateGreeting, getHealthMap } from '../../src/utils/ngu-hanh.js';

describe('analyzeNguHanh', () => {
    it('1990 → Canh Ngọ → Kim', () => {
        const r = analyzeNguHanh(1990);
        expect(r.thienCan).toBe('Canh');
        expect(r.diaChi).toBe('Ngọ');
        expect(r.element).toBe('Kim');
        expect(r.amDuong).toBe('Dương');
        expect(r.conGiap).toBe('Ngựa');
    });

    it('2000 → Canh Thìn → Kim', () => {
        const r = analyzeNguHanh(2000);
        expect(r.thienCan).toBe('Canh');
        expect(r.diaChi).toBe('Thìn');
        expect(r.element).toBe('Kim');
        expect(r.conGiap).toBe('Rồng');
    });

    it('1985 → Ất Sửu → Mộc', () => {
        const r = analyzeNguHanh(1985);
        expect(r.thienCan).toBe('Ất');
        expect(r.diaChi).toBe('Sửu');
        expect(r.element).toBe('Mộc');
        expect(r.amDuong).toBe('Âm');
        expect(r.conGiap).toBe('Trâu');
    });

    it('1996 → Bính Tý → Hỏa', () => {
        const r = analyzeNguHanh(1996);
        expect(r.thienCan).toBe('Bính');
        expect(r.element).toBe('Hỏa');
        expect(r.diaChi).toBe('Tý');
        expect(r.conGiap).toBe('Chuột');
    });

    it('1992 → Nhâm Thân → Thủy', () => {
        const r = analyzeNguHanh(1992);
        expect(r.thienCan).toBe('Nhâm');
        expect(r.element).toBe('Thủy');
        expect(r.diaChi).toBe('Thân');
        expect(r.conGiap).toBe('Khỉ');
    });

    it('1998 → Mậu Dần → Thổ', () => {
        const r = analyzeNguHanh(1998);
        expect(r.thienCan).toBe('Mậu');
        expect(r.element).toBe('Thổ');
        expect(r.diaChi).toBe('Dần');
        expect(r.conGiap).toBe('Hổ');
    });

    it('trả về đầy đủ fields', () => {
        const r = analyzeNguHanh(1990);
        expect(r).toHaveProperty('birthYear', 1990);
        expect(r).toHaveProperty('canChi');
        expect(r).toHaveProperty('thienCan');
        expect(r).toHaveProperty('amDuong');
        expect(r).toHaveProperty('diaChi');
        expect(r).toHaveProperty('conGiap');
        expect(r).toHaveProperty('element');
        expect(r).toHaveProperty('elementIcon');
        expect(r).toHaveProperty('colorHex');
        expect(r).toHaveProperty('colorGradient');
        expect(r).toHaveProperty('organTarget');
        expect(r).toHaveProperty('organIcon');
        expect(r).toHaveProperty('weakness');
        expect(r).toHaveProperty('strength');
        expect(r).toHaveProperty('healthAdvice');
        expect(r).toHaveProperty('recommendation');
        expect(r).toHaveProperty('dietTip');
        expect(r).toHaveProperty('compatibleElements');
        expect(r).toHaveProperty('conflictingElements');
        expect(r).toHaveProperty('season');
        expect(r).toHaveProperty('emotionalKey');
    });

    it('trả null cho năm < 1900', () => {
        expect(analyzeNguHanh(1899)).toBeNull();
        expect(analyzeNguHanh(100)).toBeNull();
    });

    it('trả null cho năm > 2100', () => {
        expect(analyzeNguHanh(2101)).toBeNull();
        expect(analyzeNguHanh(3000)).toBeNull();
    });

    it('trả null cho NaN', () => {
        expect(analyzeNguHanh(NaN)).toBeNull();
        expect(analyzeNguHanh('abc')).toBeNull();
        expect(analyzeNguHanh(undefined)).toBeNull();
        expect(analyzeNguHanh(null)).toBeNull();
    });

    it('chấp nhận string số', () => {
        const r = analyzeNguHanh('1990');
        expect(r.element).toBe('Kim');
    });

    it('floor số thập phân', () => {
        const r = analyzeNguHanh(1990.7);
        expect(r.element).toBe('Kim');
    });

    it('canChi đúng format "Can Chi"', () => {
        const r = analyzeNguHanh(1990);
        expect(r.canChi).toBe('Canh Ngọ');
    });

    it('biên giới: năm 1900 hợp lệ', () => {
        const r = analyzeNguHanh(1900);
        expect(r).not.toBeNull();
        expect(r.element).toBeTruthy();
    });

    it('biên giới: năm 2100 hợp lệ', () => {
        const r = analyzeNguHanh(2100);
        expect(r).not.toBeNull();
    });
});

describe('getAllElements', () => {
    it('trả 5 elements', () => {
        const elements = getAllElements();
        expect(elements).toHaveLength(5);
    });

    it('mỗi element có name, icon, color, organ', () => {
        const elements = getAllElements();
        elements.forEach(el => {
            expect(el).toHaveProperty('name');
            expect(el).toHaveProperty('icon');
            expect(el).toHaveProperty('color');
            expect(el).toHaveProperty('organ');
        });
    });

    it('chứa đúng 5 hành: Kim, Thủy, Mộc, Hỏa, Thổ', () => {
        const names = getAllElements().map(e => e.name);
        expect(names).toContain('Kim');
        expect(names).toContain('Thủy');
        expect(names).toContain('Mộc');
        expect(names).toContain('Hỏa');
        expect(names).toContain('Thổ');
    });
});

describe('generateGreeting', () => {
    it('trả lời chào chứa tên người dùng', () => {
        const greeting = generateGreeting('Hùng', 1990);
        expect(greeting).toContain('Hùng');
    });

    it('trả lời chào chứa hành', () => {
        const greeting = generateGreeting('Hùng', 1990);
        expect(greeting).toContain('Kim');
    });

    it('trả lời chào mặc định khi năm sinh không hợp lệ', () => {
        const greeting = generateGreeting('Lan', 'abc');
        expect(greeting).toContain('Lan');
        expect(greeting).toContain('sức khỏe');
    });

    it('trả greeting cho mỗi hành', () => {
        // Kim (1990), Thủy (1992), Mộc (1985), Hỏa (1996), Thổ (1998)
        const pairs = [
            [1990, 'Kim'], [1992, 'Thủy'], [1985, 'Mộc'],
            [1996, 'Hỏa'], [1998, 'Thổ'],
        ];
        for (const [year, hanh] of pairs) {
            const greeting = generateGreeting('Test', year);
            expect(greeting).toContain(hanh);
        }
    });
});

describe('getHealthMap', () => {
    it('trả object render-ready cho năm hợp lệ', () => {
        const map = getHealthMap(1990);
        expect(map).not.toBeNull();
        expect(map).toHaveProperty('title');
        expect(map).toHaveProperty('icon');
        expect(map).toHaveProperty('color');
        expect(map).toHaveProperty('gradient');
        expect(map).toHaveProperty('canChi');
        expect(map).toHaveProperty('amDuong');
        expect(map).toHaveProperty('sections');
    });

    it('title chứa tên hành', () => {
        const map = getHealthMap(1990);
        expect(map.title).toContain('Kim');
    });

    it('sections có 6 mục', () => {
        const map = getHealthMap(1990);
        expect(map.sections).toHaveLength(6);
    });

    it('mỗi section có label và value', () => {
        const map = getHealthMap(1990);
        map.sections.forEach(s => {
            expect(s).toHaveProperty('label');
            expect(s).toHaveProperty('value');
        });
    });

    it('trả null cho năm không hợp lệ', () => {
        expect(getHealthMap('abc')).toBeNull();
        expect(getHealthMap(0)).toBeNull();
    });

    it('section cuối là "Thông điệp dành riêng cho bạn"', () => {
        const map = getHealthMap(1990);
        const last = map.sections[map.sections.length - 1];
        expect(last.label).toContain('Thông điệp');
    });
});
