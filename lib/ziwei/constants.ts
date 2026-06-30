// 天干 Heavenly Stems
export const STEMS = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
export const STEMS_VI = ['Giáp', 'Ất', 'Bính', 'Đinh', 'Mậu', 'Kỷ', 'Canh', 'Tân', 'Nhâm', 'Quý'];

// 地支 Earthly Branches
export const BRANCHES = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
export const BRANCHES_VI = ['Tý', 'Sửu', 'Dần', 'Mão', 'Thìn', 'Tỵ', 'Ngọ', 'Mùi', 'Thân', 'Dậu', 'Tuất', 'Hợi'];

// 时辰对应地支
export const SHICHEN = [
  { branch: 0, name: '子时', range: '23:00-01:00' },
  { branch: 1, name: '丑时', range: '01:00-03:00' },
  { branch: 2, name: '寅时', range: '03:00-05:00' },
  { branch: 3, name: '卯时', range: '05:00-07:00' },
  { branch: 4, name: '辰时', range: '07:00-09:00' },
  { branch: 5, name: '巳时', range: '09:00-11:00' },
  { branch: 6, name: '午时', range: '11:00-13:00' },
  { branch: 7, name: '未时', range: '13:00-15:00' },
  { branch: 8, name: '申时', range: '15:00-17:00' },
  { branch: 9, name: '酉时', range: '17:00-19:00' },
  { branch: 10, name: '戌时', range: '19:00-21:00' },
  { branch: 11, name: '亥时', range: '21:00-23:00' },
];

// 十二宫名，从命宫顺时针
export const PALACE_NAMES_ORDER = [
  '命宫', '兄弟宫', '夫妻宫', '子女宫', '财帛宫', '疾厄宫',
  '迁移宫', '交友宫', '官禄宫', '田宅宫', '福德宫', '父母宫'
];

// 纳音五行（30组干支对的五行）
export const NAYIN_ELEMENTS = [
  '金','火','木','土','金','火','水','土','金','木',
  '水','土','火','木','水','金','火','木','土','金',
  '火','水','土','金','木','水','土','火','木','水'
];

// 五行 → 局数
export const ELEMENT_TO_JU: Record<string, number> = {
  '水': 2, '木': 3, '金': 4, '土': 5, '火': 6
};

// 局数名称 → Vietnamese Ngũ Hành Cục
export const JU_NAMES: Record<number, string> = {
  2: 'Thủy Nhị Cục', 3: 'Mộc Tam Cục', 4: 'Kim Tứ Cục', 5: 'Thổ Ngũ Cục', 6: 'Hỏa Lục Cục'
};

// ─── Tên cung (12 cung Tử Vi) → Tiếng Việt ──────────────────────────────────
export const PALACE_NAME_VI: Record<string, string> = {
  '命宫':   'Mệnh',
  '兄弟宫': 'Huynh Đệ',
  '夫妻宫': 'Phu Thê',
  '子女宫': 'Tử Tức',
  '财帛宫': 'Tài Bạch',
  '疾厄宫': 'Tật Ách',
  '迁移宫': 'Thiên Di',
  '交友宫': 'Giao Hữu',
  '仆役宫': 'Nô Bộc',
  '官禄宫': 'Quan Lộc',
  '田宅宫': 'Điền Trạch',
  '福德宫': 'Phúc Đức',
  '父母宫': 'Phụ Mẫu',
  '命': 'Mệnh',
  '兄弟': 'Huynh Đệ',
  '夫妻': 'Phu Thê',
  '子女': 'Tử Tức',
  '财帛': 'Tài Bạch',
  '疾厄': 'Tật Ách',
  '迁移': 'Thiên Di',
  '交友': 'Giao Hữu',
  '仆役': 'Nô Bộc',
  '官禄': 'Quan Lộc',
  '田宅': 'Điền Trạch',
  '福德': 'Phúc Đức',
  '父母': 'Phụ Mẫu',
};

// ─── Tên sao → Tiếng Việt (14 chính tinh + phụ tinh phổ biến) ────────────────
export const STAR_NAME_VI: Record<string, string> = {
  // 14 Chính tinh
  '紫微': 'Tử Vi',
  '天机': 'Thiên Cơ',
  '太阳': 'Thái Dương',
  '武曲': 'Vũ Khúc',
  '天同': 'Thiên Đồng',
  '廉贞': 'Liêm Trinh',
  '天府': 'Thiên Phủ',
  '太阴': 'Thái Âm',
  '贪狼': 'Tham Lang',
  '巨门': 'Cự Môn',
  '天相': 'Thiên Tướng',
  '天梁': 'Thiên Lương',
  '七杀': 'Thất Sát',
  '破军': 'Phá Quân',
  // Phụ tinh cát
  '左辅': 'Tả Phụ',
  '右弼': 'Hữu Bật',
  '文昌': 'Văn Xương',
  '文曲': 'Văn Khúc',
  '天魁': 'Thiên Khôi',
  '天钺': 'Thiên Việt',
  '禄存': 'Lộc Tồn',
  '天马': 'Thiên Mã',
  '化禄': 'Hóa Lộc',
  '化权': 'Hóa Quyền',
  '化科': 'Hóa Khoa',
  '化忌': 'Hóa Kỵ',
  '红鸾': 'Hồng Loan',
  '天喜': 'Thiên Hỷ',
  '天姚': 'Thiên Diêu',
  '咸池': 'Hàm Trì',
  '解神': 'Giải Thần',
  '天巫': 'Thiên Vu',
  '天福': 'Thiên Phúc',
  '三台': 'Tam Thai',
  '八座': 'Bát Tọa',
  '恩光': 'Ân Quang',
  '天贵': 'Thiên Quý',
  '台辅': 'Đài Phụ',
  '封诰': 'Phong Cáo',
  '天寿': 'Thiên Thọ',
  '月德': 'Nguyệt Đức',
  '天德': 'Thiên Đức',
  '龙池': 'Long Trì',
  '凤阁': 'Phượng Các',
  // Phụ tinh hung
  '擎羊': 'Kình Dương',
  '陀罗': 'Đà La',
  '火星': 'Hỏa Tinh',
  '铃星': 'Linh Tinh',
  '天空': 'Thiên Không',
  '地劫': 'Địa Kiếp',
  '地空': 'Địa Không',
  '天刑': 'Thiên Hình',
  '天虚': 'Thiên Hư',
  '天哭': 'Thiên Khốc',
  '孤辰': 'Cô Thần',
  '寡宿': 'Quả Tú',
  '破碎': 'Phá Toái',
  '大耗': 'Đại Hao',
  '小耗': 'Tiểu Hao',
  '劫煞': 'Kiếp Sát',
  '华盖': 'Hoa Cái',
  '岁建': 'Tuế Kiến',
  '晦气': 'Hối Khí',
  '丧门': 'Tang Môn',
  '贯索': 'Quán Sách',
  '官符': 'Quan Phù',
  '岁破': 'Tuế Phá',
  '龙德': 'Long Đức',
  '白虎': 'Bạch Hổ',
  '吊客': 'Điếu Khách',
  '病符': 'Bệnh Phù',
};

// ─── Mô tả sao (phiên âm Việt) ──────────────────────────────────────────────
export const STAR_DESCRIPTIONS_VI: Record<string, { keywords: string; nature: string; element: string }> = {
  'Tử Vi':    { keywords: 'Đế vương · Tôn quý · Độc lập', nature: 'Trung tính thiên cát', element: 'Thổ' },
  'Thiên Cơ': { keywords: 'Trí tuệ · Mưu lược · Linh hoạt', nature: 'Cát tinh', element: 'Mộc' },
  'Thái Dương': { keywords: 'Dương cương · Quan quý · Hào phóng', nature: 'Cát tinh', element: 'Hỏa' },
  'Vũ Khúc':  { keywords: 'Tài phú · Cương nghị · Quả đoán', nature: 'Trung tính', element: 'Kim' },
  'Thiên Đồng': { keywords: 'Ôn hòa · Hưởng phúc · Tùy duyên', nature: 'Cát tinh', element: 'Thủy' },
  'Liêm Trinh': { keywords: 'Tài nghệ · Hình tù · Đào hoa', nature: 'Hung mang cát', element: 'Hỏa' },
  'Thiên Phủ': { keywords: 'Tài khố · Bình ổn · Bảo thủ', nature: 'Cát tinh', element: 'Thổ' },
  'Thái Âm':  { keywords: 'Nhu mỹ · Tài phú · Âm nhu', nature: 'Cát tinh', element: 'Thủy' },
  'Tham Lang': { keywords: 'Dục vọng · Đào hoa · Đa tài', nature: 'Trung tính', element: 'Mộc' },
  'Cự Môn':   { keywords: 'Khẩu thiệt · Thị phi · Thiện biện', nature: 'Hung mang cát', element: 'Thủy' },
  'Thiên Tướng': { keywords: 'Phụ tá · Hành chính · Ấn thụ', nature: 'Cát tinh', element: 'Thủy' },
  'Thiên Lương': { keywords: 'Âm hộ · Y dược · Bậc trưởng', nature: 'Cát tinh', element: 'Thổ' },
  'Thất Sát': { keywords: 'Tướng tinh · Quả quyết · Cô khắc', nature: 'Hung tinh', element: 'Kim' },
  'Phá Quân': { keywords: 'Khai sáng · Biến động · Phá hoại', nature: 'Hung tinh', element: 'Thủy' },
};


// 四化表（年干 → [化禄, 化权, 化科, 化忌]）
export const SI_HUA_TABLE: Record<number, [string, string, string, string]> = {
  0: ['廉贞', '破军', '武曲', '太阳'],   // 甲
  1: ['天机', '天梁', '紫微', '太阴'],   // 乙
  2: ['天同', '天机', '文昌', '廉贞'],   // 丙
  3: ['太阴', '天同', '天机', '巨门'],   // 丁
  4: ['贪狼', '太阴', '右弼', '天机'],   // 戊
  5: ['武曲', '贪狼', '天梁', '文曲'],   // 己
  6: ['太阳', '武曲', '太阴', '天同'],   // 庚
  7: ['巨门', '太阳', '文曲', '文昌'],   // 辛
  8: ['天梁', '紫微', '左辅', '武曲'],   // 壬
  9: ['破军', '巨门', '太阴', '贪狼'],   // 癸
};

// 天魁天钺表（年干 → [天魁branch, 天钺branch]）
export const TIANKUI_TABLE: Record<number, [number, number]> = {
  0: [1, 7],   // 甲: 魁丑 钺未
  1: [0, 8],   // 乙: 魁子 钺申
  2: [11, 9],  // 丙: 魁亥 钺酉
  3: [11, 9],  // 丁: 魁亥 钺酉
  4: [1, 7],   // 戊: 魁丑 钺未
  5: [0, 8],   // 己: 魁子 钺申
  6: [1, 7],   // 庚: 魁丑 钺未
  7: [6, 2],   // 辛: 魁午 钺寅
  8: [3, 5],   // 壬: 魁卯 钺巳
  9: [3, 5],   // 癸: 魁卯 钺巳
};

// 禄存表（年干 → 禄存branch）
export const LUCUN_TABLE: Record<number, number> = {
  0: 2,   // 甲: 寅
  1: 3,   // 乙: 卯
  2: 5,   // 丙: 巳
  3: 6,   // 丁: 午
  4: 5,   // 戊: 巳
  5: 6,   // 己: 午
  6: 8,   // 庚: 申
  7: 9,   // 辛: 酉
  8: 11,  // 壬: 亥
  9: 0,   // 癸: 子
};

// 天马表（年支三合 → 天马branch）
// 寅午戌→申, 申子辰→寅, 巳酉丑→亥, 亥卯未→巳
export const TIANMA_TABLE: Record<number, number> = {
  2: 8,   // 寅年 → 申
  6: 8,   // 午年 → 申
  10: 8,  // 戌年 → 申
  8: 2,   // 申年 → 寅
  0: 2,   // 子年 → 寅
  4: 2,   // 辰年 → 寅
  5: 11,  // 巳年 → 亥
  9: 11,  // 酉年 → 亥
  1: 11,  // 丑年 → 亥
  11: 5,  // 亥年 → 巳
  3: 5,   // 卯年 → 巳
  7: 5,   // 未年 → 巳
};

// 主星亮度表 [branch]: 主星亮度映射
// 庙(bright) 旺(bright) 利(normal) 平(normal) 不利(dim) 陷(dim)
export const STAR_BRIGHTNESS: Record<string, Record<number, string>> = {
  '紫微': { 2:   'bright', 5: 'bright', 8: 'bright', 11: 'bright',
            1: 'normal', 4: 'normal', 7: 'bright', 10: 'normal',
            0: 'normal', 3: 'dim', 6: 'dim', 9: 'normal' },
  '天机': { 5: 'bright', 11: 'bright', 3: 'bright', 9: 'bright',
            1: 'normal', 7: 'normal', 2: 'dim', 8: 'dim',
            0: 'normal', 4: 'normal', 6: 'normal', 10: 'normal' },
  '太阳': { 3: 'bright', 4: 'bright', 5: 'bright', 6: 'bright',
            7: 'normal', 8: 'normal', 9: 'normal', 10: 'dim',
            11: 'dim', 0: 'dim', 1: 'dim', 2: 'normal' },
  '武曲': { 2: 'bright', 5: 'bright', 8: 'bright', 11: 'bright',
            0: 'normal', 3: 'normal', 6: 'normal', 9: 'normal',
            1: 'dim', 4: 'dim', 7: 'dim', 10: 'dim' },
  '天同': { 0: 'bright', 3: 'bright', 6: 'bright', 9: 'bright',
            2: 'normal', 5: 'normal', 8: 'normal', 11: 'normal',
            1: 'dim', 4: 'dim', 7: 'dim', 10: 'dim' },
  '廉贞': { 2: 'bright', 5: 'bright', 8: 'bright', 11: 'bright',
            0: 'normal', 3: 'normal', 6: 'normal', 9: 'normal',
            1: 'dim', 4: 'dim', 7: 'dim', 10: 'dim' },
};

// 主星描述（倪海夏体系）
export const STAR_DESCRIPTIONS: Record<string, { keywords: string; nature: string; element: string }> = {
  '紫微': { keywords: '帝王·尊贵·独立', nature: '中性偏吉', element: '土' },
  '天机': { keywords: '智慧·机变·谋略', nature: '吉星', element: '木' },
  '太阳': { keywords: '阳刚·官贵·慷慨', nature: '吉星', element: '火' },
  '武曲': { keywords: '财富·刚毅·果断', nature: '中性', element: '金' },
  '天同': { keywords: '温和·享福·随缘', nature: '吉星', element: '水' },
  '廉贞': { keywords: '才艺·刑囚·桃花', nature: '凶中带吉', element: '火' },
  '天府': { keywords: '财库·稳重·保守', nature: '吉星', element: '土' },
  '太阴': { keywords: '柔美·财富·阴柔', nature: '吉星', element: '水' },
  '贪狼': { keywords: '欲望·桃花·多才', nature: '中性', element: '木' },
  '巨门': { keywords: '口舌·是非·善辩', nature: '凶中带吉', element: '水' },
  '天相': { keywords: '辅佐·行政·印绶', nature: '吉星', element: '水' },
  '天梁': { keywords: '荫护·医药·长辈', nature: '吉星', element: '土' },
  '七杀': { keywords: '将星·果决·孤克', nature: '凶星', element: '金' },
  '破军': { keywords: '开创·变动·破坏', nature: '凶星', element: '水' },
};
