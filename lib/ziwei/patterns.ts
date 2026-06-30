/**
 * 紫微斗数格局识别（v2 严格化版本）
 *
 * 设计原则：
 * 1. 古书条件优先：每个格局列出"必须 / 加分 / 破格"三层结构，出处可考
 * 2. 倪师立场：不使用宫干自化、大限四化、来因宫等飞星派工具
 * 3. 庙旺利陷：用 brightness 字段（bright=庙旺、normal=平、dim=陷）
 * 4. 三方四正会照：命宫 + 财帛 + 官禄 + 迁移
 * 5. 夹宫：命宫前后两宫
 *
 * 主要古籍出处：
 *  - 《紫微斗数全集》（陈抟祖师传，明代刊本）
 *  - 《紫微斗数全书》（罗洪先编，明代刊本）
 *  - 《骨髓赋》《女命骨髓赋》《十二宫诸星得地合格诀》
 *  - 倪海厦《天纪》紫微斗数讲义
 */

import type { ZiweiChart, Palace, Star } from './types';

// ────────────────── 类型 ──────────────────
export interface PatternCondition {
  required: string[];   // 必须满足条件（已通过的）
  bonus?: string[];     // 加分项（已触发）
  breaking?: string[];  // 破格警示（已触发）
}

export interface Pattern {
  name: string;
  level: 'excellent' | 'good' | 'neutral' | 'caution';
  description: string;
  palaces: string[];                 // 涉及宫位
  conditions?: PatternCondition;     // 成立条件分层（v2 新增）
  source?: string;                   // 古籍出处（v2 新增）
}

// ────────────────── 常量 ──────────────────
const SHA_NAMES = ['擎羊', '陀罗', '火星', '铃星', '地空', '地劫'];
const SHA_HARD = ['擎羊', '陀罗', '火星', '铃星'];   // 四煞
const SHA_KONG = ['地空', '地劫'];                  // 空劫
const ZUO_YOU = ['左辅', '右弼'];
const CHANG_QU = ['文昌', '文曲'];
const KUI_YUE = ['天魁', '天钺'];

// ────────────────── 辅助函数 ──────────────────
function getMajorStarNames(palace: Palace): string[] {
  return palace.stars.filter(s => s.type === 'major').map(s => s.name);
}
function findStar(palace: Palace, name: string): Star | undefined {
  return palace.stars.find(s => s.name === name);
}
function hasStar(palace: Palace, name: string): boolean {
  return palace.stars.some(s => s.name === name);
}
function findStarPalace(chart: ZiweiChart, name: string): Palace | undefined {
  return chart.palaces.find(p => p.stars.some(s => s.name === name));
}
function getPalaceByBranch(chart: ZiweiChart, branch: number): Palace | undefined {
  return chart.palaces.find(p => p.branch === ((branch % 12) + 12) % 12);
}
function shaCountInPalace(palace: Palace, list: string[] = SHA_HARD): number {
  return palace.stars.filter(s => list.includes(s.name)).length;
}
function hasShaInPalace(palace: Palace, list: string[] = SHA_NAMES): boolean {
  return palace.stars.some(s => list.includes(s.name));
}
function getSanFangPalaces(chart: ZiweiChart): Palace[] {
  const m = chart.mingGongBranch;
  const branches = [m, (m + 4) % 12, (m + 8) % 12, (m + 6) % 12];
  return chart.palaces.filter(p => branches.includes(p.branch));
}
function isInSanFang(chart: ZiweiChart, branch: number): boolean {
  const m = chart.mingGongBranch;
  return [m, (m + 4) % 12, (m + 8) % 12, (m + 6) % 12].includes(branch);
}
function getDuiGong(chart: ZiweiChart, branch: number): Palace | undefined {
  return getPalaceByBranch(chart, (branch + 6) % 12);
}
function getJiaPalaces(chart: ZiweiChart, branch: number): { prev?: Palace; next?: Palace } {
  return {
    prev: getPalaceByBranch(chart, (branch + 11) % 12),
    next: getPalaceByBranch(chart, (branch + 1) % 12),
  };
}
function sanFangAllStars(chart: ZiweiChart): Set<string> {
  return new Set(getSanFangPalaces(chart).flatMap(p => p.stars.map(s => s.name)));
}
function sanFangShaCount(chart: ZiweiChart, list: string[] = SHA_HARD): number {
  return getSanFangPalaces(chart).reduce((sum, p) => sum + shaCountInPalace(p, list), 0);
}
function isBright(palace: Palace, starName: string): boolean {
  const s = findStar(palace, starName);
  return s?.brightness === 'bright';
}
function isDim(palace: Palace, starName: string): boolean {
  const s = findStar(palace, starName);
  return s?.brightness === 'dim';
}
function getStarSiHua(palace: Palace, starName: string): Star['siHua'] | undefined {
  return findStar(palace, starName)?.siHua;
}
const BRANCH_NAMES = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

// ────────────────── 正格识别器 ──────────────────

/** 君臣庆会：紫微入命，左辅右弼同会（同宫或三方） */
function detectJunChenQingHui(chart: ZiweiChart, ming: Palace, patterns: Pattern[]) {
  if (!hasStar(ming, '紫微')) return;
  const sanFangSet = sanFangAllStars(chart);
  const hasZuo = sanFangSet.has('左辅');
  const hasYou = sanFangSet.has('右弼');
  if (!hasZuo || !hasYou) return;

  const required = ['Tử Vi nhập Mệnh', 'Tả Phụ Hữu Bật đồng hội Tam Phương Tứ Chính'];
  const bonus: string[] = [];
  const breaking: string[] = [];
  if (sanFangSet.has('文昌') || sanFangSet.has('文曲')) bonus.push('Lại hội Văn Xương hoặc Văn Khúc');
  if (sanFangSet.has('天魁') || sanFangSet.has('天钺')) bonus.push('Khôi Việt quý nhân gia chiếu');
  if (getStarSiHua(ming, '紫微') === '权') bonus.push('Tử Vi Hóa Quyền');
  if (sanFangShaCount(chart, SHA_KONG) >= 2) breaking.push('Địa Không Địa Kiếp song giáp hội chiếu (Tử Vi kỵ Không Kiếp)');

  patterns.push({
    name: 'Quân Thần Khánh Hội',
    level: breaking.length ? 'good' : 'excellent',
    description: 'Tử Vi nhập Mệnh, Tả Phụ Hữu Bật đồng hội, Đế vương được hiền thần phò tá, chủ đại phú đại quý, mệnh thống ngự. Cả đời quý nhân không dứt, hợp đi theo con đường chính trị thương mại, lãnh đạo đa ngành.',
    palaces: ['命宫'],
    conditions: { required, bonus, breaking },
    source: '《Tử Vi Đẩu Số Toàn Thư·Quân Thần Khánh Hội Cách》',
  });
}

/** 紫府同宫：紫微+天府于命宫（限寅、申宫） */
function detectZiFu(chart: ZiweiChart, ming: Palace, patterns: Pattern[]) {
  const ziwei = findStarPalace(chart, '紫微');
  const tianfu = findStarPalace(chart, '天府');
  if (!ziwei || !tianfu || ziwei.branch !== tianfu.branch) return;

  const inMing = ziwei.branch === chart.mingGongBranch;
  const required = inMing
    ? ['Tử Vi Thiên Phủ đồng cung nhập Mệnh']
    : ['Tử Vi Thiên Phủ đồng cung (không ở Mệnh Cung, hội chiếu giảm lực)'];
  const bonus: string[] = [];
  const breaking: string[] = [];
  const sanFangSet = sanFangAllStars(chart);
  if (sanFangSet.has('左辅') && sanFangSet.has('右弼')) bonus.push('Tả Phụ Hữu Bật đồng hội');
  if (sanFangSet.has('文昌') || sanFangSet.has('文曲')) bonus.push('Lại hội Xương Khúc');
  if (hasShaInPalace(ziwei, SHA_KONG)) breaking.push('Tử Phủ cung tọa Không Kiếp (phá quý khí của Tử Phủ)');
  if (shaCountInPalace(ziwei, SHA_HARD) >= 2) breaking.push('Tử Phủ cung kiến song sát đồng tọa');

  patterns.push({
    name: 'Tử Phủ Đồng Cung',
    level: inMing && !breaking.length ? 'excellent' : 'good',
    description: inMing
      ? 'Tử Vi Thiên Phủ đồng nhập Mệnh Cung, Đế Tướng kề nhau, mệnh tôn quý. Chủ phẩm hạnh đoan chính, cơm áo không lo, có tài lãnh đạo, hợp đảm nhiệm chức vụ quan trọng. Cần có Tả Hữu Phụ Bật phối hợp mới thành đại cách hoàn chỉnh.'
      : 'Tử Vi Thiên Phủ đồng cung nhưng không tọa Mệnh, chủ cả đời có quý nhân quý khí nương tựa, nhưng bản thân không hẳn đại phú quý, cần xem cát sát hội chiếu mà định.',
    palaces: [ziwei.name],
    conditions: { required, bonus, breaking },
    source: '《Tử Vi Đẩu Số Toàn Thư·Tử Phủ Đồng Cung Cách》',
  });
}

/** 府相朝垣：天府、天相分别坐守命宫的三方四正 */
function detectFuXiangChaoYuan(chart: ZiweiChart, ming: Palace, patterns: Pattern[]) {
  const tianfu = findStarPalace(chart, '天府');
  const tianxiang = findStarPalace(chart, '天相');
  if (!tianfu || !tianxiang) return;
  if (!isInSanFang(chart, tianfu.branch) || !isInSanFang(chart, tianxiang.branch)) return;
  if (tianfu.branch === chart.mingGongBranch && tianxiang.branch === chart.mingGongBranch) return;
  if (tianfu.branch === tianxiang.branch) return;

  const required = ['Thiên Phủ tọa Mệnh tam phương', 'Thiên Tướng tọa Mệnh tam phương', 'Hai sao không đồng cung'];
  const bonus: string[] = [];
  const breaking: string[] = [];
  if (hasStar(ming, '禄存') || hasStar(ming, '化禄')) bonus.push('Mệnh cung kiến Lộc');
  if (sanFangAllStars(chart).has('左辅')) bonus.push('Lại hội Tả Phụ');
  if (hasShaInPalace(ming, SHA_HARD)) breaking.push('Mệnh cung tọa sát tinh');
  if (sanFangShaCount(chart, SHA_HARD) >= 3) breaking.push('Tam phương tứ chính sát tinh quá nhiều');

  patterns.push({
    name: 'Phủ Tướng Triều Viên',
    level: breaking.length ? 'good' : 'excellent',
    description: 'Thiên Phủ Thiên Tướng phân thủ Mệnh Cung tam phương tứ chính, văn võ song toàn, quyền ấn song huy, chủ cả đời cơm áo dồi dào, địa vị tôn sùng. Cổ thư nói "Phủ Tướng triều viên thiên chung thực lộc", thường thấy ở giới chính trị, quản lý xí nghiệp.',
    palaces: [tianfu.name, tianxiang.name],
    conditions: { required, bonus, breaking },
    source: '《Tử Vi Đẩu Số Toàn Thư·Phủ Tướng Triều Viên Cách》',
  });
}

/** 阳梁昌禄：太阳+天梁+文昌+禄存四星会命宫，大贵格 */
function detectYangLiangChangLu(chart: ZiweiChart, ming: Palace, patterns: Pattern[]) {
  const sanFangSet = sanFangAllStars(chart);
  if (!sanFangSet.has('太阳') || !sanFangSet.has('天梁') ||
      !sanFangSet.has('文昌') || !sanFangSet.has('禄存')) return;

  const sun = findStarPalace(chart, '太阳')!;
  const liang = findStarPalace(chart, '天梁')!;
  const required = [
    'Thái Dương hội Mệnh Cung tam phương',
    'Thiên Lương hội Mệnh Cung tam phương',
    'Văn Xương hội Mệnh Cung tam phương',
    'Lộc Tồn hội Mệnh Cung tam phương',
  ];
  const bonus: string[] = [];
  const breaking: string[] = [];
  if (isBright(sun, '太阳')) bonus.push('Thái Dương miếu vượng');
  if (isBright(liang, '天梁')) bonus.push('Thiên Lương miếu vượng');
  if (sanFangSet.has('化科')) bonus.push('Lại hội Hóa Khoa');
  if (isDim(sun, '太阳')) breaking.push('Thái Dương hãm địa (Dương Lương thất huy)');
  if (sanFangShaCount(chart, SHA_HARD) >= 2) breaking.push('Tam phương sát tinh nặng');

  patterns.push({
    name: 'Dương Lương Xương Lộc',
    level: breaking.length ? 'good' : 'excellent',
    description: 'Thái Dương, Thiên Lương, Văn Xương, Lộc Tồn tứ tinh cùng hội Mệnh Cung tam phương, được xưng là "Khoa cử chi tinh", chủ thanh quý hiển đạt, vận thi cử cực tốt, hợp đi theo con đường học thuật, văn giáo, nghiên cứu, thi cử, cả đời công danh dễ đạt.',
    palaces: [sun.name, liang.name],
    conditions: { required, bonus, breaking },
    source: '《Tử Vi Đẩu Số Toàn Thư·Dương Lương Xương Lộc Cách》',
  });
}

/** 火贪格 / 铃贪格：贪狼+火星 或 贪狼+铃星 同宫或会照 */
function detectHuoTanLingTan(chart: ZiweiChart, ming: Palace, patterns: Pattern[]) {
  const tan = findStarPalace(chart, '贪狼');
  if (!tan) return;
  const huo = findStarPalace(chart, '火星');
  const ling = findStarPalace(chart, '铃星');

  for (const [shaName, shaPalace] of [['火星', huo], ['铃星', ling]] as const) {
    if (!shaPalace) continue;
    const sameOrTrine =
      tan.branch === shaPalace.branch ||
      (tan.branch + 4) % 12 === shaPalace.branch ||
      (tan.branch + 8) % 12 === shaPalace.branch ||
      (tan.branch + 6) % 12 === shaPalace.branch;
    if (!sameOrTrine) continue;
    if (!isInSanFang(chart, tan.branch)) continue;

    const required = [`Tham Lang ${tan.branch === shaPalace.branch ? 'đồng cung' : 'hội chiếu'} ${shaName}`, 'Tham Lang hội chiếu Mệnh Cung tam phương'];
    const bonus: string[] = [];
    const breaking: string[] = [];
    if (isBright(tan, '贪狼')) bonus.push('Tham Lang miếu vượng');
    if (getStarSiHua(tan, '贪狼') === '禄' || getStarSiHua(tan, '贪狼') === '权') bonus.push('Tham Lang Hóa Lộc/Hóa Quyền');
    if (hasShaInPalace(tan, ['擎羊', '陀罗'])) breaking.push('Tham Lang cung lại thấy Kình Đà (phá lực hoạnh phát)');
    if (hasShaInPalace(tan, SHA_KONG)) breaking.push('Tham Lang ngộ Không Kiếp (tài lai tài khứ)');

    patterns.push({
      name: shaName === '火星' ? 'Hỏa Tham Cách' : 'Linh Tham Cách',
      level: breaking.length ? 'good' : 'excellent',
      description: `Tham Lang ngộ ${shaName} ${tan.branch === shaPalace.branch ? 'đồng cung' : 'tam phương hội chiếu'}, chủ đột phát hoạnh tài, cơ hội đến bất ngờ. Cổ thư nói "Tham Lang ngộ Hỏa Linh, tất phát hoạnh tài", nhưng đến nhanh đi cũng nhanh, nên biết điểm dừng. ${breaking.length ? 'Bản bàn phá cách đã bị kích hoạt, phát lực giảm sút.' : ''}`,
      palaces: [tan.name, shaPalace.name],
      conditions: { required, bonus, breaking },
      source: '《Tử Vi Đẩu Số Cốt Tủy Phú》',
    });
  }
}

/** 武贪格：武曲+贪狼 同宫（丑、未） 或 对照 */
function detectWuTan(chart: ZiweiChart, ming: Palace, patterns: Pattern[]) {
  const wu = findStarPalace(chart, '武曲');
  const tan = findStarPalace(chart, '贪狼');
  if (!wu || !tan) return;
  const sameOrOppose = wu.branch === tan.branch || (wu.branch + 6) % 12 === tan.branch;
  if (!sameOrOppose) return;
  if (!isInSanFang(chart, wu.branch) && !isInSanFang(chart, tan.branch)) return;

  const required = [
    wu.branch === tan.branch ? 'Vũ Khúc Tham Lang đồng cung (Sửu/Mùi)' : 'Vũ Khúc Tham Lang đối cung củng chiếu',
    'Hội chiếu Mệnh Cung tam phương',
  ];
  const bonus: string[] = [];
  const breaking: string[] = [];
  if (sanFangAllStars(chart).has('火星') || sanFangAllStars(chart).has('铃星'))
    bonus.push('Lại ngộ Hỏa Tinh/Linh Tinh (Hỏa Tham/Linh Tham điệp gia)');
  if (getStarSiHua(wu, '武曲') === '禄') bonus.push('Vũ Khúc Hóa Lộc');
  if (hasShaInPalace(wu, ['擎羊', '陀罗'])) breaking.push('Vũ Tham cung kiến Kình Đà');
  if (hasShaInPalace(wu, SHA_KONG)) breaking.push('Vũ Tham cung ngộ Không Kiếp');

  patterns.push({
    name: 'Vũ Tham Cách',
    level: breaking.length ? 'good' : 'excellent',
    description: 'Vũ Khúc Tham Lang hội mệnh, Tài tinh cùng Đào hoa dục vọng tinh giao huy, cổ thư nói "Vũ Tham bất phát thiếu niên nhân" —— qua tuổi ba mươi mới có thể hậu tích bạc phát. Chủ trung niên về sau đại phú đại quý, nguồn tài chính đến từ nhân mạch, thù tạc, quản lý dục vọng, hợp với tài chính, đầu cơ, buôn bán, ngành giải trí.',
    palaces: [wu.name, tan.name],
    conditions: { required, bonus, breaking },
    source: '《Tử Vi Đẩu Số Cốt Tủy Phú》',
  });
}

/** 杀破狼：七杀、破军、贪狼三方齐聚 */
function detectShaPoLang(chart: ZiweiChart, ming: Palace, patterns: Pattern[]) {
  const sanFangSet = sanFangAllStars(chart);
  const has = ['七杀', '破军', '贪狼'].filter(s => sanFangSet.has(s));
  if (has.length < 3) return;

  const required = ['Thất Sát, Phá Quân, Tham Lang tam tinh tề nhập Mệnh Cung tam phương tứ chính'];
  const bonus: string[] = [];
  const breaking: string[] = [];
  if (sanFangSet.has('化禄') || sanFangSet.has('化权')) bonus.push('Tam phương có Hóa Lộc hoặc Hóa Quyền (Động mà có lực)');
  if (sanFangSet.has('左辅') && sanFangSet.has('右弼')) bonus.push('Phụ Bật đồng hội (Trong biến động có quý nhân)');
  if (sanFangShaCount(chart, SHA_HARD) >= 3) breaking.push('Sát tinh quá nặng (Động mà không thành)');
  if (hasShaInPalace(ming, SHA_KONG)) breaking.push('Mệnh tọa Không Kiếp (Động vất vả)');

  patterns.push({
    name: 'Sát Phá Lang',
    level: breaking.length ? 'caution' : 'good',
    description: 'Thất Sát, Phá Quân, Tham Lang tam tinh hội Mệnh, là mệnh cách khai sáng xông pha. Cả đời biến động nhiều, không cam chịu bình phàm, hợp với lập nghiệp, quân cảnh, kinh doanh, buôn bán. Sau tuổi trung niên mới có thể ổn định thành tựu, lúc trẻ dễ vì kích động mà thất lợi.',
    palaces: getSanFangPalaces(chart).filter(p => has.includes(getMajorStarNames(p)[0])).map(p => p.name),
    conditions: { required, bonus, breaking },
    source: '《Tử Vi Đẩu Số Toàn Thư·Sát Phá Lang》',
  });
}

/** 机月同梁：天机、太阴、天同、天梁四星齐入命迁财官 */
function detectJiYueTongLiang(chart: ZiweiChart, ming: Palace, patterns: Pattern[]) {
  const sanFangSet = sanFangAllStars(chart);
  const has = ['天机', '太阴', '天同', '天梁'].filter(s => sanFangSet.has(s));
  if (has.length < 4) return;

  const required = ['Thiên Cơ, Thái Âm, Thiên Đồng, Thiên Lương tứ tinh tề nhập Mệnh Cung tam phương tứ chính'];
  const bonus: string[] = [];
  const breaking: string[] = [];
  if (sanFangSet.has('文昌') || sanFangSet.has('文曲')) bonus.push('Lại hội Xương Khúc');
  if (sanFangSet.has('化科')) bonus.push('Lại hội Hóa Khoa');
  if (sanFangShaCount(chart, SHA_HARD) >= 3) breaking.push('Sát tinh quá nhiều (Cơ Nguyệt Đồng Lương kỵ sát)');
  if (hasShaInPalace(ming, SHA_HARD)) breaking.push('Mệnh cung tọa sát');

  patterns.push({
    name: 'Cơ Nguyệt Đồng Lương',
    level: breaking.length ? 'good' : 'excellent',
    description: 'Thiên Cơ, Thái Âm, Thiên Đồng, Thiên Lương tứ tinh tề nhập Mệnh Tài Quan Di, văn chất bân bân, thông minh khéo léo. Rất hợp với các ngành nghề cần sự ổn định tích lũy như công chức, học thuật, văn nghệ, y tế, phục vụ, không hợp với mạo hiểm đầu cơ lớn.',
    palaces: getSanFangPalaces(chart).filter(p => has.some(s => getMajorStarNames(p).includes(s))).map(p => p.name),
    conditions: { required, bonus, breaking },
    source: '《Tử Vi Đẩu Số Toàn Thư·Cơ Nguyệt Đồng Lương Cách》',
  });
}

/** 廉贞天相：同宫 */
function detectLianXiang(chart: ZiweiChart, patterns: Pattern[]) {
  const lian = findStarPalace(chart, '廉贞');
  const xiang = findStarPalace(chart, '天相');
  if (!lian || !xiang || lian.branch !== xiang.branch) return;

  const inMing = lian.branch === chart.mingGongBranch;
  const required = ['Liêm Trinh Thiên Tướng đồng cung'];
  const bonus: string[] = [];
  const breaking: string[] = [];
  if (hasStar(lian, '禄存') || getStarSiHua(lian, '廉贞') === '禄') bonus.push('Kiến Lộc Tồn hoặc Liêm Trinh Hóa Lộc');
  if (sanFangAllStars(chart).has('左辅')) bonus.push('Tả Phụ hội chiếu');
  if (hasShaInPalace(lian, ['擎羊'])) breaking.push('Liêm Tướng cung tọa Kình Dương (xu hướng Liêm Sát Dương)');
  if (getStarSiHua(lian, '廉贞') === '忌') breaking.push('Liêm Trinh Hóa Kỵ');

  patterns.push({
    name: 'Liêm Trinh Thiên Tướng',
    level: breaking.length ? 'caution' : (inMing ? 'good' : 'neutral'),
    description: 'Liêm Trinh Thiên Tướng đồng cung, ấn thụ cách cục, chủ làm việc công bằng, liêm khiết, hợp đảm nhiệm công chức, hành chính quản lý, pháp vụ, kế hoạch. Sợ ngộ Kình Dương, Hóa Kỵ, ngược lại chủ quan phi (vạ miệng).',
    palaces: [lian.name],
    conditions: { required, bonus, breaking },
    source: '《Tử Vi Đẩu Số Toàn Thư》',
  });
}

/** 武曲七杀：同宫，将星配财星 */
function detectWuQiSha(chart: ZiweiChart, patterns: Pattern[]) {
  const wu = findStarPalace(chart, '武曲');
  const qi = findStarPalace(chart, '七杀');
  if (!wu || !qi || wu.branch !== qi.branch) return;

  const inMing = wu.branch === chart.mingGongBranch;
  const required = ['Vũ Khúc Thất Sát đồng cung'];
  const bonus: string[] = [];
  const breaking: string[] = [];
  if (getStarSiHua(wu, '武曲') === '权') bonus.push('Vũ Khúc Hóa Quyền');
  if (getStarSiHua(wu, '武曲') === '禄') bonus.push('Vũ Khúc Hóa Lộc');
  if (getStarSiHua(wu, '武曲') === '忌') breaking.push('Vũ Khúc Hóa Kỵ (Vũ Khúc Hóa Kỵ là triệu chứng tài kiếp)');
  if (hasShaInPalace(wu, ['擎羊', '陀罗', '火星', '铃星'])) breaking.push('Vũ Sát cung sát tinh quá nhiều');

  patterns.push({
    name: 'Vũ Khúc Thất Sát',
    level: breaking.length ? 'caution' : (inMing ? 'excellent' : 'good'),
    description: 'Vũ Khúc Thất Sát đồng cung, Tướng tinh phối Tài tinh, chủ quyết đoán cương nghị, năng lực quản lý tài chính mạnh, hợp với tài chính, quân cảnh, lập nghiệp. Nhưng kỵ ngộ Hóa Kỵ, sát tinh, nếu không thì hung hiểm. Cả đời phấn đấu, tích tài nhưng lao tâm.',
    palaces: [wu.name],
    conditions: { required, bonus, breaking },
    source: '《Tử Vi Đẩu Số Toàn Thư》',
  });
}

/** 天同天梁：同宫 */
function detectTongLiang(chart: ZiweiChart, patterns: Pattern[]) {
  const tong = findStarPalace(chart, '天同');
  const liang = findStarPalace(chart, '天梁');
  if (!tong || !liang || tong.branch !== liang.branch) return;

  const required = ['Thiên Đồng Thiên Lương đồng cung'];
  const bonus: string[] = [];
  const breaking: string[] = [];
  if (sanFangAllStars(chart).has('文昌')) bonus.push('Văn Xương hội chiếu');
  if (getStarSiHua(tong, '天同') === '禄') bonus.push('Thiên Đồng Hóa Lộc');
  if (hasShaInPalace(tong, SHA_HARD)) breaking.push('Sát tinh đồng tọa');

  patterns.push({
    name: 'Thiên Đồng Thiên Lương',
    level: breaking.length ? 'neutral' : 'good',
    description: 'Thiên Đồng Thiên Lương đồng cung, Phúc tinh và Ấm tinh cùng hội, chủ khoan dung hòa thiện, thích giúp đỡ người khác, hợp y tế, giáo dục, tôn giáo, phúc lợi xã hội. Nhưng tính cách ôn hòa bảo thủ, khó thành đại cục phú quý lớn.',
    palaces: [tong.name],
    conditions: { required, bonus, breaking },
    source: '《Tử Vi Đẩu Số Toàn Thư》',
  });
}

/** 日月同宫：太阳太阴丑或未宫同宫 */
function detectRiYueTongGong(chart: ZiweiChart, patterns: Pattern[]) {
  const sun = findStarPalace(chart, '太阳');
  const moon = findStarPalace(chart, '太阴');
  if (!sun || !moon || sun.branch !== moon.branch) return;
  if (sun.branch !== 1 && sun.branch !== 7) return;  // 必须丑(1) 或 未(7)

  const inMing = sun.branch === chart.mingGongBranch;
  const required = [`Thái Dương Thái Âm đồng nhập cung ${BRANCH_NAMES[sun.branch]}`];
  const bonus: string[] = [];
  const breaking: string[] = [];
  if (sun.branch === 7) bonus.push('Mùi cung Nhật Nguyệt đồng huy (cổ thư nói Mùi cung Nhật Nguyệt song mỹ)');
  if (sanFangAllStars(chart).has('文昌') && sanFangAllStars(chart).has('文曲')) bonus.push('Xương Khúc hội chiếu');
  if (hasShaInPalace(sun, SHA_HARD)) breaking.push('Nhật Nguyệt cung sát tinh đồng tọa');

  patterns.push({
    name: 'Nhật Nguyệt Đồng Cung',
    level: breaking.length ? 'good' : (inMing ? 'excellent' : 'good'),
    description: `Thái Dương Thái Âm tại cung ${BRANCH_NAMES[sun.branch]} đồng cung, âm dương cân bằng, văn võ vẹn toàn. Chủ dị tính duyên tốt, sự nghiệp thuận lợi, danh tiếng vang xa. ${sun.branch === 7 ? 'Mùi cung Nhật Nguyệt song mỹ đặc biệt tốt.' : 'Sửu cung Nhật Nguyệt đồng cung lực lượng khá bình thường.'}`,
    palaces: [sun.name],
    conditions: { required, bonus, breaking },
    source: '《Tử Vi Đẩu Số Toàn Thư》',
  });
}

/** 日月夹命：太阳太阴在命宫前后两宫 */
function detectRiYueJiaMing(chart: ZiweiChart, patterns: Pattern[]) {
  const { prev, next } = getJiaPalaces(chart, chart.mingGongBranch);
  if (!prev || !next) return;
  const prevHasSun = hasStar(prev, '太阳');
  const prevHasMoon = hasStar(prev, '太阴');
  const nextHasSun = hasStar(next, '太阳');
  const nextHasMoon = hasStar(next, '太阴');
  const ok = (prevHasSun && nextHasMoon) || (prevHasMoon && nextHasSun);
  if (!ok) return;

  const sunPalace = prevHasSun ? prev : next;
  const moonPalace = prevHasMoon ? prev : next;
  const required = ['Thái Dương Thái Âm phân cư ở hai cung trước sau Mệnh Cung'];
  const bonus: string[] = [];
  const breaking: string[] = [];
  if (isBright(sunPalace, '太阳')) bonus.push('Thái Dương miếu vượng');
  if (isBright(moonPalace, '太阴')) bonus.push('Thái Âm miếu vượng');
  if (isDim(sunPalace, '太阳') || isDim(moonPalace, '太阴')) breaking.push('Nhật Nguyệt hãm địa (giáp Mệnh vô quang)');

  patterns.push({
    name: 'Nhật Nguyệt Giáp Mệnh',
    level: breaking.length ? 'good' : 'excellent',
    description: 'Thái Dương Thái Âm phân cư hai bên Mệnh Cung giáp chiếu, quang minh lỗi lạc, cả đời có quý nhân tương trợ, sự nghiệp bừng bừng. Nam chủ quan quý, nữ vượng phu ích tử. Nhật Nguyệt cần không lạc hãm mới là chân giáp.',
    palaces: [sunPalace.name, moonPalace.name],
    conditions: { required, bonus, breaking },
    source: '《Tử Vi Đẩu Số Toàn Thư·Nhật Nguyệt Giáp Mệnh》',
  });
}

/** 巨日同宫：巨门太阳同入寅或申 */
function detectJuRiTongGong(chart: ZiweiChart, patterns: Pattern[]) {
  const ju = findStarPalace(chart, '巨门');
  const sun = findStarPalace(chart, '太阳');
  if (!ju || !sun || ju.branch !== sun.branch) return;
  if (ju.branch !== 2 && ju.branch !== 8) return;  // 必须寅(2) 或 申(8)

  const inMing = ju.branch === chart.mingGongBranch;
  const required = [`Cự Môn Thái Dương đồng nhập cung ${BRANCH_NAMES[ju.branch]}`];
  const bonus: string[] = [];
  const breaking: string[] = [];
  if (ju.branch === 2) bonus.push('Dần cung Thái Dương miếu vượng, Cự Môn được ánh mặt trời hóa giải thị phi');
  if (getStarSiHua(ju, '巨门') === '禄' || getStarSiHua(ju, '巨门') === '权') bonus.push('Cự Môn Hóa Lộc/Hóa Quyền (khẩu tài sinh tài)');
  if (getStarSiHua(ju, '巨门') === '忌') breaking.push('Cự Môn Hóa Kỵ (khẩu thiệt quan phi)');
  if (ju.branch === 8) breaking.push('Thân cung Thái Dương ngả về tây, Cự Môn ám diệu càng hiển');

  patterns.push({
    name: 'Cự Nhật Đồng Cung',
    level: breaking.length ? 'caution' : (inMing && ju.branch === 2 ? 'excellent' : 'good'),
    description: `Cự Môn Thái Dương đồng cung ${BRANCH_NAMES[ju.branch]}, Thái Dương hóa giải Cự Môn ám diệu, chủ lấy khẩu tài, truyền thông, ngoại ngữ, chuyên môn lập nghiệp. Cung Dần là tốt nhất, cung Thân lực giảm. Sợ Cự Môn Hóa Kỵ ắt sinh quan phi.`,
    palaces: [ju.name],
    conditions: { required, bonus, breaking },
    source: '《Tử Vi Đẩu Số Toàn Thư·Cự Nhật Đồng Cung》',
  });
}

/** 石中隐玉：巨门入命于子午宫 */
function detectShiZhongYinYu(chart: ZiweiChart, ming: Palace, patterns: Pattern[]) {
  if (!hasStar(ming, '巨门')) return;
  if (ming.branch !== 0 && ming.branch !== 6) return;  // 子(0) 或 午(6)

  const required = [`Cự Môn nhập Mệnh tại cung ${BRANCH_NAMES[ming.branch]}`];
  const bonus: string[] = [];
  const breaking: string[] = [];
  if (getStarSiHua(ming, '巨门') === '禄' || getStarSiHua(ming, '巨门') === '权') bonus.push('Cự Môn Hóa Lộc/Hóa Quyền');
  if (sanFangAllStars(chart).has('文昌')) bonus.push('Văn Xương hội chiếu (Thạch trung ẩn ngọc được sáng)');
  if (getStarSiHua(ming, '巨门') === '忌') breaking.push('Cự Môn Hóa Kỵ (Ngọc giấu dưới bùn sâu)');
  if (hasShaInPalace(ming, SHA_HARD)) breaking.push('Mệnh tọa sát tinh');

  patterns.push({
    name: 'Thạch Trung Ẩn Ngọc',
    level: breaking.length ? 'caution' : 'excellent',
    description: 'Cự Môn tọa mệnh Tý Ngọ, bề ngoài bình phàm mà bên trong uẩn súc tài học. Thời trẻ âm thầm không ai biết, trung niên mới hiển lộ quý khí, hợp đi theo chuyên môn, nghiên cứu, khẩu tài, truyền thông. Cần có Lộc Quyền hoặc Văn Xương tương trợ mới có thể "đục đá thấy ngọc".',
    palaces: ['命宫'],
    conditions: { required, bonus, breaking },
    source: '《Tử Vi Đẩu Số Cốt Tủy Phú·Thạch Trung Ẩn Ngọc》',
  });
}

/** 明珠出海：命宫在未空宫，对宫丑宫为太阳太阴 */
function detectMingZhuChuHai(chart: ZiweiChart, ming: Palace, patterns: Pattern[]) {
  if (ming.branch !== 7) return;   // 命在未
  if (getMajorStarNames(ming).length > 0) return;   // 命宫为空宫
  const dui = getDuiGong(chart, ming.branch);
  if (!dui) return;
  if (!hasStar(dui, '太阳') || !hasStar(dui, '太阴')) return;

  const required = ['Mệnh Cung tại Mùi là cung vô chính diệu (Trống)', 'Đối cung Sửu cung có Thái Dương Thái Âm đồng cung'];
  const bonus: string[] = [];
  const breaking: string[] = [];
  if (sanFangAllStars(chart).has('文昌') || sanFangAllStars(chart).has('文曲')) bonus.push('Lại hội Xương Khúc');
  if (sanFangAllStars(chart).has('左辅') || sanFangAllStars(chart).has('右弼')) bonus.push('Phụ Bật tương trợ');
  if (sanFangShaCount(chart, SHA_HARD) >= 2) breaking.push('Sát tinh hội chiếu (Châu quang ảm đạm)');

  patterns.push({
    name: 'Minh Châu Xuất Hải',
    level: breaking.length ? 'good' : 'excellent',
    description: 'Mệnh vô chính diệu tại Mùi, đối cung Sửu cung Nhật Nguyệt đồng huy củng chiếu, hiệu là "Minh Châu Xuất Hải". Chủ xuất thân bình phàm, hậu thiên nỗ lực vươn lên, hợp đi xa quê hương, nghiên cứu học thuật hoặc làm vị trí cao trong công ty lớn, chủ đại phú đại quý.',
    palaces: ['命宫', dui.name],
    conditions: { required, bonus, breaking },
    source: '《Tử Vi Đẩu Số Toàn Tập·Minh Châu Xuất Hải》',
  });
}

/** 紫微独坐入命 */
function detectZiWeiInMing(chart: ZiweiChart, ming: Palace, patterns: Pattern[]) {
  if (!hasStar(ming, '紫微') || hasStar(ming, '天府')) return;

  const required = ['Tử Vi độc tọa Mệnh Cung (không có Thiên Phủ đồng tọa)'];
  const bonus: string[] = [];
  const breaking: string[] = [];
  const sanFangSet = sanFangAllStars(chart);
  if (sanFangSet.has('左辅') && sanFangSet.has('右弼')) bonus.push('Tả Phụ Hữu Bật đồng hội');
  if (sanFangSet.has('文昌') && sanFangSet.has('文曲')) bonus.push('Văn Xương Văn Khúc đồng hội');
  if (!sanFangSet.has('左辅') && !sanFangSet.has('右弼')) breaking.push('Không có Phụ Bật (Cô quân vô thần)');
  if (hasShaInPalace(ming, SHA_KONG)) breaking.push('Tử Vi ngộ Không Kiếp (cổ thư tối kỵ)');

  patterns.push({
    name: 'Tử Vi Nhập Mệnh',
    level: breaking.length ? 'caution' : (bonus.length ? 'excellent' : 'good'),
    description: 'Tử Vi độc tọa Mệnh Cung, tinh tú đế vương, lòng tự trọng cao, có sức hút lãnh đạo. Nhưng Tử Vi kỵ nhất "tại dã cô quân" —— nếu không có Tả Hữu Phụ Bật tương hội, ngược lại trở thành cô độc kiêu ngạo, dễ rước lấy sự phỉ báng.',
    palaces: ['命宫'],
    conditions: { required, bonus, breaking },
    source: '《Tử Vi Đẩu Số Toàn Thư》',
  });
}

/** 辅弼夹命 */
function detectFuBiJiaMing(chart: ZiweiChart, patterns: Pattern[]) {
  const { prev, next } = getJiaPalaces(chart, chart.mingGongBranch);
  if (!prev || !next) return;
  const prevHasZuo = hasStar(prev, '左辅');
  const prevHasYou = hasStar(prev, '右弼');
  const nextHasZuo = hasStar(next, '左辅');
  const nextHasYou = hasStar(next, '右弼');
  if (!((prevHasZuo && nextHasYou) || (prevHasYou && nextHasZuo))) return;

  const required = ['Tả Phụ Hữu Bật phân cư ở hai cung trước sau Mệnh Cung'];
  const bonus: string[] = [];
  const breaking: string[] = [];
  if (sanFangAllStars(chart).has('天魁') || sanFangAllStars(chart).has('天钺')) bonus.push('Lại hội Khôi Việt');

  patterns.push({
    name: 'Phụ Bật Giáp Mệnh',
    level: 'excellent',
    description: 'Tả Phụ Hữu Bật giáp Mệnh, cả đời quý nhân không dứt, phùng hung hóa cát. Hợp đi theo con đường quan trường, quản lý doanh nghiệp lớn, có mệnh được quý nhân nâng đỡ. Cổ thư nói "Tả Phụ Hữu Bật, chung thân phúc hậu".',
    palaces: ['命宫', prev.name, next.name],
    conditions: { required, bonus, breaking },
    source: '《Tử Vi Đẩu Số Toàn Thư·Phụ Bật Giáp Mệnh》',
  });
}

/** 昌曲夹命 */
function detectChangQuJiaMing(chart: ZiweiChart, patterns: Pattern[]) {
  const { prev, next } = getJiaPalaces(chart, chart.mingGongBranch);
  if (!prev || !next) return;
  const prevHasChang = hasStar(prev, '文昌');
  const prevHasQu = hasStar(prev, '文曲');
  const nextHasChang = hasStar(next, '文昌');
  const nextHasQu = hasStar(next, '文曲');
  if (!((prevHasChang && nextHasQu) || (prevHasQu && nextHasChang))) return;

  patterns.push({
    name: 'Xương Khúc Giáp Mệnh',
    level: 'excellent',
    description: 'Văn Xương Văn Khúc giáp Mệnh Cung, chủ thông minh tuấn tú, văn chương lai láng, hợp đi theo con đường văn giáo, học thuật, nghệ thuật, viết lách. Cổ thư nói "Xương Khúc giáp Mệnh chủ khoa giáp", lợi thi cử nhất.',
    palaces: ['命宫', prev.name, next.name],
    conditions: { required: ['Văn Xương Văn Khúc phân cư ở hai cung trước sau Mệnh Cung'] },
    source: '《Tử Vi Đẩu Số Toàn Thư》',
  });
}

/** 魁钺夹命 */
function detectKuiYueJiaMing(chart: ZiweiChart, patterns: Pattern[]) {
  const { prev, next } = getJiaPalaces(chart, chart.mingGongBranch);
  if (!prev || !next) return;
  const okA = hasStar(prev, '天魁') && hasStar(next, '天钺');
  const okB = hasStar(prev, '天钺') && hasStar(next, '天魁');
  if (!okA && !okB) return;

  patterns.push({
    name: 'Khôi Việt Giáp Mệnh',
    level: 'good',
    description: 'Thiên Khôi Thiên Việt giáp Mệnh, nam gọi là Thiên Ất, nữ gọi là Ngọc Đường, cả đời có quý nhân nâng đỡ. Thi cử, xin việc, những thời khắc quan trọng thường có quý nhân bất ngờ giúp đỡ.',
    palaces: ['命宫', prev.name, next.name],
    conditions: { required: ['Thiên Khôi Thiên Việt phân cư ở hai cung trước sau Mệnh Cung'] },
    source: '《Tử Vi Đẩu Số Toàn Thư》',
  });
}

/** 双禄朝垣：化禄 + 禄存 同会三方 */
function detectShuangLuChaoYuan(chart: ZiweiChart, ming: Palace, patterns: Pattern[]) {
  const sanFang = getSanFangPalaces(chart);
  let huaLuFound = false;
  let luCunFound = false;
  for (const p of sanFang) {
    if (p.stars.some(s => s.siHua === '禄')) huaLuFound = true;
    if (hasStar(p, '禄存')) luCunFound = true;
  }
  if (!huaLuFound || !luCunFound) return;

  patterns.push({
    name: 'Song Lộc Triều Viên',
    level: 'excellent',
    description: 'Hóa Lộc, Lộc Tồn đồng hội Mệnh Cung tam phương tứ chính, tài nguyên dồi dào, cơm áo sung túc. Cổ thư nói "Song Lộc triều viên, phú tỷ Đào Chu", chủ cả đời không lo tiền bạc, thường kiêm đắc cả chính tài và hoạnh tài.',
    palaces: sanFang.map(p => p.name),
    conditions: {
      required: ['Hóa Lộc hội chiếu tam phương tứ chính', 'Lộc Tồn hội chiếu tam phương tứ chính'],
      breaking: hasShaInPalace(ming, SHA_KONG) ? ['Mệnh tọa Không Kiếp (Song Lộc ngộ không, tài lai tài khứ)'] : undefined,
    },
    source: '《Tử Vi Đẩu Số Toàn Thư·Song Lộc Triều Viên》',
  });
}

/** 三奇加会：化禄 化权 化科 同会三方 */
function detectSanQiJiaHui(chart: ZiweiChart, patterns: Pattern[]) {
  const sanFangPalaces = getSanFangPalaces(chart);
  let lu = false, quan = false, ke = false;
  for (const p of sanFangPalaces) {
    for (const s of p.stars) {
      if (s.siHua === '禄') lu = true;
      if (s.siHua === '权') quan = true;
      if (s.siHua === '科') ke = true;
    }
  }
  if (!(lu && quan && ke)) return;

  patterns.push({
    name: 'Tam Kỳ Gia Hội',
    level: 'excellent',
    description: 'Hóa Lộc, Hóa Quyền, Hóa Khoa tam cát hóa tề hội Mệnh Cung tam phương tứ chính, hiệu là "Tam Kỳ Gia Hội". Chủ cả đời công danh, tài phú, quý nhân tam toàn, là một trong những cát cách cao nhất của Tử Vi Đẩu Số.',
    palaces: sanFangPalaces.map(p => p.name),
    conditions: { required: ['Hóa Lộc, Hóa Quyền, Hóa Khoa tam cát hóa tề hội Mệnh Cung tam phương tứ chính'] },
    source: '《Tử Vi Đẩu Số Toàn Thư·Tam Kỳ Gia Hội》',
  });
}

/** 化禄入命/官/财 */
function detectHuaLuRuMing(chart: ZiweiChart, ming: Palace, patterns: Pattern[]) {
  const huaLuStar = ming.stars.find(s => s.siHua === '禄' && s.type === 'major');
  if (!huaLuStar) return;

  patterns.push({
    name: `${huaLuStar.name} Hóa Lộc nhập Mệnh`,
    level: 'good',
    description: `${huaLuStar.name} Hóa Lộc tọa Mệnh, chủ sinh tài thuận lợi, nhân duyên tốt, cơ duyên nhiều. ${huaLuStar.name === '武曲' ? 'Vũ Khúc Hóa Lộc thuộc chính tài, hợp thực nghiệp, tài chính.' : huaLuStar.name === '太阴' ? 'Thái Âm Hóa Lộc thuộc âm tài, bất động sản.' : huaLuStar.name === '贪狼' ? 'Tham Lang Hóa Lộc thuộc nhân mạch tài, đào hoa tài.' : ''}`,
    palaces: ['命宫'],
    conditions: { required: [`${huaLuStar.name} Hóa Lộc tọa Mệnh Cung`] },
    source: '《Tử Vi Đẩu Số Toàn Thư》',
  });
}

// ────────────────── 恶格识别器 ──────────────────

/** 化忌入命/迁 */
function detectHuaJiRuMingQian(chart: ZiweiChart, patterns: Pattern[]) {
  const qianBranch = (chart.mingGongBranch + 6) % 12;
  for (const palace of chart.palaces) {
    if (palace.branch !== chart.mingGongBranch && palace.branch !== qianBranch) continue;
    const jiStar = palace.stars.find(s => s.siHua === '忌' && s.type === 'major');
    if (!jiStar) continue;

    const inMing = palace.branch === chart.mingGongBranch;
    patterns.push({
      name: `${jiStar.name} Hóa Kỵ nhập ${inMing ? 'Mệnh' : 'Di'}`,
      level: 'caution',
      description: inMing
        ? `${jiStar.name} Hóa Kỵ tọa Mệnh Cung, cần lưu ý sự cố chấp, chướng ngại tâm lý hoặc sức khỏe, mọi chuyện nên lùi một bước. Hóa Kỵ không hẳn là xấu, nó đại diện cho năng lượng của sao này cần được đặc biệt quan tâm.`
        : `${jiStar.name} Hóa Kỵ tọa Thiên Di Cung, ra ngoài, đi xa, quan hệ nhân tế dễ gặp sóng gió, nên tĩnh không nên động.`,
      palaces: [palace.name],
      conditions: { required: [`${jiStar.name} Hóa Kỵ tọa ${inMing ? 'Mệnh' : 'Di'} cung`] },
      source: '《Tử Vi Đẩu Số Toàn Thư》',
    });
  }
}

/** 羊陀夹忌：化忌坐宫，左右被擎羊陀罗夹 */
function detectYangTuoJiaJi(chart: ZiweiChart, patterns: Pattern[]) {
  for (const palace of chart.palaces) {
    const jiStar = palace.stars.find(s => s.siHua === '忌');
    if (!jiStar) continue;
    if (palace.branch !== chart.mingGongBranch) continue;   // 只看命宫被夹

    const { prev, next } = getJiaPalaces(chart, palace.branch);
    if (!prev || !next) continue;
    const aPrev = hasStar(prev, '擎羊') && hasStar(next, '陀罗');
    const aNext = hasStar(prev, '陀罗') && hasStar(next, '擎羊');
    if (!aPrev && !aNext) continue;

    patterns.push({
      name: 'Dương Đà Giáp Kỵ',
      level: 'caution',
      description: 'Hóa Kỵ tọa mệnh, tả hữu có Kình Dương Đà La giáp Mệnh, cổ thư nói "Dương Đà giáp Kỵ vi bại cục", chủ cả đời bôn ba vất vả, long đong lận đận, thân tâm mệt mỏi. Cần dùng đức độ tu dưỡng và tích cực làm việc để hóa giải, phàm làm việc gì cũng nên cẩn thận.',
      palaces: ['命宫', prev.name, next.name],
      conditions: { required: ['Hóa Kỵ tọa Mệnh', 'Kình Dương Đà La phân cư hai cung trước sau Mệnh Cung'] },
      source: '《Tử Vi Đẩu Số Cốt Tủy Phú·Dương Đà Giáp Kỵ》',
    });
    return;
  }
}

/** 火铃夹命：火星铃星分居命宫前后 */
function detectHuoLingJiaMing(chart: ZiweiChart, patterns: Pattern[]) {
  const { prev, next } = getJiaPalaces(chart, chart.mingGongBranch);
  if (!prev || !next) return;
  const okA = hasStar(prev, '火星') && hasStar(next, '铃星');
  const okB = hasStar(prev, '铃星') && hasStar(next, '火星');
  if (!okA && !okB) return;

  patterns.push({
    name: 'Hỏa Linh Giáp Mệnh',
    level: 'caution',
    description: 'Hỏa Tinh Linh Tinh phân cư hai cung trước sau giáp Mệnh, chủ tính nóng nảy, dễ bốc đồng, tai nạn bất ngờ hoặc tranh chấp. Cần rèn luyện tính nhẫn nại, tránh các quyết định nông nổi.',
    palaces: ['命宫', prev.name, next.name],
    conditions: { required: ['Hỏa Tinh Linh Tinh phân cư ở hai cung trước sau Mệnh Cung'] },
    source: '《Tử Vi Đẩu Số Toàn Thư》',
  });
}

/** 空劫夹命：地空地劫分居命宫前后 */
function detectKongJieJiaMing(chart: ZiweiChart, patterns: Pattern[]) {
  const { prev, next } = getJiaPalaces(chart, chart.mingGongBranch);
  if (!prev || !next) return;
  const okA = hasStar(prev, '地空') && hasStar(next, '地劫');
  const okB = hasStar(prev, '地劫') && hasStar(next, '地空');
  if (!okA && !okB) return;

  patterns.push({
    name: 'Không Kiếp Giáp Mệnh',
    level: 'caution',
    description: 'Địa Không Địa Kiếp giáp Mệnh, chủ tài lai tài khứ, tư tưởng khác thường, dễ đi vào tôn giáo triết học. Cổ thư nói "Không Kiếp giáp Mệnh, tài bất tụ". Hợp làm kỹ nghệ, tôn giáo, nghiên cứu không màng vật chất.',
    palaces: ['命宫', prev.name, next.name],
    conditions: { required: ['Địa Không Địa Kiếp phân cư hai cung trước sau Mệnh Cung'] },
    source: '《Tử Vi Đẩu Số Toàn Thư》',
  });
}

/** 廉杀羊：廉贞、七杀、擎羊三星会照（流年大限最凶） */
function detectLianShaYang(chart: ZiweiChart, patterns: Pattern[]) {
  const sanFangSet = sanFangAllStars(chart);
  if (!(sanFangSet.has('廉贞') && sanFangSet.has('七杀') && sanFangSet.has('擎羊'))) return;

  patterns.push({
    name: 'Liêm Sát Dương',
    level: 'caution',
    description: 'Liêm Trinh, Thất Sát, Kình Dương tam tinh hội chiếu Mệnh Cung tam phương, là hung cách cảnh báo của cổ thư. Chủ huyết quang, quan phi, tai nạn bất ngờ. Bản mệnh có cách này không cần hoảng sợ, nhưng khi đại hạn lưu niên kích hoạt cần đặc biệt cẩn thận lái xe, tránh xung đột, chú ý rủi ro phẫu thuật.',
    palaces: ['命宫'],
    conditions: { required: ['Liêm Trinh, Thất Sát, Kình Dương tam tinh hội chiếu tam phương tứ chính'] },
    source: '《Tử Vi Đẩu Số Toàn Thư·Liêm Sát Dương》',
  });
}

/** 巨火羊：巨门、火星、擎羊会照 */
function detectJuHuoYang(chart: ZiweiChart, patterns: Pattern[]) {
  const sanFangSet = sanFangAllStars(chart);
  if (!(sanFangSet.has('巨门') && sanFangSet.has('火星') && sanFangSet.has('擎羊'))) return;

  patterns.push({
    name: 'Cự Hỏa Dương',
    level: 'caution',
    description: 'Cự Môn, Hỏa Tinh, Kình Dương tam tinh hội chiếu, cổ thư nói "Cự Hỏa Dương, chung thân ải tử" —— hung cách thời xưa. Quan điểm hiện đại: dễ vì khẩu thiệt, xung đột kịch liệt mà chuốc họa lớn. Cần tu tâm dưỡng tính, cẩn trọng lời nói, tránh cảm xúc cực đoan.',
    palaces: ['命宫'],
    conditions: { required: ['Cự Môn, Hỏa Tinh, Kình Dương tam tinh hội chiếu tam phương tứ chính'] },
    source: '《Tử Vi Đẩu Số Cốt Tủy Phú·Cự Hỏa Dương》',
  });
}

/** 铃昌陀武：铃星、文昌、陀罗、武曲会照（限至投河） */
function detectLingChangTuoWu(chart: ZiweiChart, patterns: Pattern[]) {
  const sanFangSet = sanFangAllStars(chart);
  if (!(sanFangSet.has('铃星') && sanFangSet.has('文昌') && sanFangSet.has('陀罗') && sanFangSet.has('武曲'))) return;

  patterns.push({
    name: 'Linh Xương Đà Vũ',
    level: 'caution',
    description: 'Linh Tinh, Văn Xương, Đà La, Vũ Khúc tứ tinh tề hội, cổ thư nói "Linh Xương Đà Vũ, hạn chí đầu hà" —— đại hung cách thời xưa. Bản mệnh có tổ hợp này không cần hoảng sợ, nhưng khi đại hạn lưu niên kích hoạt cần hết sức cảnh giác với quyết định lớn, cảm xúc bất ổn, tránh hoạt động gần nước.',
    palaces: ['命宫'],
    conditions: { required: ['Linh Tinh, Văn Xương, Đà La, Vũ Khúc tứ tinh hội chiếu tam phương tứ chính'] },
    source: '《Tử Vi Đẩu Số Cốt Tủy Phú·Linh Xương Đà Vũ》',
  });
}

/** 马头带箭：擎羊在午宫坐命 */
function detectMaTouDaiJian(chart: ZiweiChart, ming: Palace, patterns: Pattern[]) {
  if (ming.branch !== 6) return;   // 必须午
  if (!hasStar(ming, '擎羊')) return;

  const required = ['Kình Dương tọa Mệnh tại cung Ngọ'];
  const bonus: string[] = [];
  const breaking: string[] = [];
  if (sanFangAllStars(chart).has('七杀') || sanFangAllStars(chart).has('破军')) bonus.push('Lại hội Thất Sát hoặc Phá Quân (võ chức đại quý)');
  if (sanFangAllStars(chart).has('天魁') || sanFangAllStars(chart).has('天钺')) bonus.push('Khôi Việt gia chiếu');

  patterns.push({
    name: 'Mã Đầu Đới Tiễn',
    level: bonus.length ? 'good' : 'caution',
    description: 'Kình Dương tọa mệnh cung Ngọ, hiệu là "Mã Đầu Đới Tiễn". Cổ thư nói "Uy trấn biên cương" —— chủ cương nghị quả quyết, có lực xung sát, hợp với quân cảnh, võ chức, vận động viên, bác sĩ ngoại khoa. Nhưng đồng thời mang theo nguy hiểm tai nạn, cần hội Sát Phá Lang hoặc Quý nhân mới là đại cách, nếu không lại chủ huyết quang.',
    palaces: ['命宫'],
    conditions: { required, bonus },
    source: '《Tử Vi Đẩu Số Cốt Tủy Phú·Mã Đầu Đới Tiễn》',
  });
}

// ────────────────── 基础格局（提升识别覆盖率）──────────────────
// 设计：让普通命盘也能识别出 1-3 个常见格局，而不是 30+ 严格古书格局都不匹配。
// 这些都是单一条件触发的轻量识别，level 多为 neutral / good。

/** 禄存守身：禄存入身宫（或命宫与身宫同宫） */
function detectLuCunShouShen(chart: ZiweiChart, patterns: Pattern[]) {
  const luCunPalace = findStarPalace(chart, '禄存');
  if (!luCunPalace) return;
  const inMing = luCunPalace.branch === chart.mingGongBranch;
  const inShen = luCunPalace.branch === chart.shenGongBranch;
  if (!inMing && !inShen) return;
  patterns.push({
    name: inMing ? 'Lộc Tồn thủ Mệnh' : 'Lộc Tồn thủ Thân',
    level: 'good',
    description: inMing
      ? 'Lộc Tồn tọa Mệnh, chủ cả đời cơm áo không lo, tài lộc ổn định. Tính cách bảo thủ, giỏi tích lũy, nhưng Dương Đà giáp Lộc cần phòng tiểu nhân. Rất hợp hội Hóa Lộc, Tả Phụ Hữu Bật mới thành đại cách.'
      : 'Lộc Tồn nhập Thân cung, chủ sau trung niên tài nguyên ổn định, được hưởng lộc. Ni sư nói "Lộc Tồn nhập Thân, tài khí cận Thân" —— phối ngẫu hoặc hướng sự nghiệp có thể mang lại tài lộc ổn định.',
    palaces: [inMing ? '命宫' : '身宫'],
    conditions: { required: [inMing ? 'Lộc Tồn nhập Mệnh Cung' : 'Lộc Tồn nhập Thân cung'] },
    source: '《Tử Vi Đẩu Số Toàn Thư·Lộc Tồn Tinh》',
  });
}

/** 天马入命/迁：驿马星动 */
function detectTianMaRuMing(chart: ZiweiChart, patterns: Pattern[]) {
  const tianMaPalace = findStarPalace(chart, '天马');
  if (!tianMaPalace) return;
  const inMing = tianMaPalace.branch === chart.mingGongBranch;
  const inQian = tianMaPalace.branch === ((chart.mingGongBranch + 6) % 12);
  if (!inMing && !inQian) return;
  patterns.push({
    name: inMing ? 'Thiên Mã nhập Mệnh' : 'Thiên Mã tại Di',
    level: 'neutral',
    description: inMing
      ? 'Thiên Mã tọa Mệnh, chủ cả đời bôn ba, trong động đắc tài, hợp buôn bán, ngoại cần, phát triển xuyên biên giới. Ni sư nói "Thiên Mã nhập Mệnh, vô Lộc bất phát" —— nếu hội Lộc Tồn hoặc Hóa Lộc tức là phú cách "Lộc Mã Giao Trì".'
      : 'Thiên Mã tại Thiên Di cung, chủ ra ngoài có lợi, đi xa đắc tài, hợp phát triển ở tha hương. Phối Hóa Lộc chủ sinh tài nơi xa, phối sát tinh thì hành trình nhiều sóng gió.',
    palaces: [tianMaPalace.name],
    conditions: { required: [inMing ? 'Thiên Mã nhập Mệnh Cung' : 'Thiên Mã nhập Thiên Di cung'] },
    source: '《Tử Vi Đẩu Số Toàn Thư·Thiên Mã Tinh》',
  });
}

/** 化禄入财：财帛宫主星化禄 */
function detectHuaLuRuCai(chart: ZiweiChart, patterns: Pattern[]) {
  const cai = chart.palaces.find(p => p.name === '财帛');
  if (!cai) return;
  const luStar = cai.stars.find(s => s.type === 'major' && s.siHua === '禄');
  if (!luStar) return;
  patterns.push({
    name: 'Hóa Lộc nhập Tài',
    level: 'good',
    description: `${luStar.name} Hóa Lộc nhập Tài Bạch Cung, chủ tài nguyên thông suốt, thu nhập ổn định. Ni sư nói Hóa Lộc là tượng trưng cho "chính tài" —— năng lực mà sao Hóa Lộc đại diện (đặc chất cốt lõi của ${luStar.name}) là trục chính kiếm tiền của bạn. Phối Lộc Tồn hoặc Thiên Mã thì tài nguyên càng rộng.`,
    palaces: ['财帛'],
    conditions: { required: [`${luStar.name} Hóa Lộc nhập Tài Bạch Cung`] },
    source: '《Tử Vi Đẩu Số Toàn Thư·Tứ Hóa Luận》',
  });
}

/** 化权入官：官禄宫主星化权 */
function detectHuaQuanRuGuan(chart: ZiweiChart, patterns: Pattern[]) {
  const guan = chart.palaces.find(p => p.name === '官禄');
  if (!guan) return;
  const quanStar = guan.stars.find(s => s.type === 'major' && s.siHua === '权');
  if (!quanStar) return;
  patterns.push({
    name: 'Hóa Quyền nhập Quan',
    level: 'good',
    description: `${quanStar.name} Hóa Quyền nhập Quan Lộc Cung, chủ sự nghiệp có sức kiểm soát, có thể đảm đương vị trí độc lập. Hóa Quyền đại diện cho quyền lực và sức chấp hành —— ${quanStar.name} Hóa Quyền cho thấy bạn có thể trở thành người ra quyết định hoặc người thực thi cốt lõi trong sự nghiệp, hợp đi theo tuyến quản lý hoặc chuyên gia kỹ thuật.`,
    palaces: ['官禄'],
    conditions: { required: [`${quanStar.name} Hóa Quyền nhập Quan Lộc Cung`] },
    source: '《Tử Vi Đẩu Số Toàn Thư·Tứ Hóa Luận》',
  });
}

/** 化科入命/身：科名加身 */
function detectHuaKeRuMingShen(chart: ZiweiChart, patterns: Pattern[]) {
  const ming = chart.palaces.find(p => p.branch === chart.mingGongBranch);
  const shen = chart.palaces.find(p => p.branch === chart.shenGongBranch);
  const target = [ming, shen].filter((p): p is Palace => Boolean(p));
  for (const p of target) {
    const keStar = p.stars.find(s => s.type === 'major' && s.siHua === '科');
    if (!keStar) continue;
    const isMing = p.branch === chart.mingGongBranch;
    patterns.push({
      name: isMing ? 'Hóa Khoa nhập Mệnh' : 'Hóa Khoa nhập Thân',
      level: 'good',
      description: `${keStar.name} Hóa Khoa nhập ${isMing ? 'Mệnh' : 'Thân'} cung, chủ danh tiếng, văn thư, học thuật vận. Ni sư nói Hóa Khoa là "Quý nhân tinh" —— ${keStar.name} Hóa Khoa mang lại đặc chất được người khác coi trọng, hợp làm văn thư, giáo dục, nghiên cứu, tư vấn, văn hóa sáng tạo v.v "lấy danh cầu lợi".`,
      palaces: [isMing ? '命宫' : '身宫'],
      conditions: { required: [`${keStar.name} Hóa Khoa nhập ${isMing ? 'Mệnh' : 'Thân'} cung`] },
      source: '《Tử Vi Đẩu Số Toàn Thư·Tứ Hóa Luận》',
    });
    return; // 命和身重复时只识别一次
  }
}

/** 机月同梁三星会（降级版）：天机/太阴/天同/天梁 任 3 星齐入三方四正 */
function detectJiYueTongLiangPartial(chart: ZiweiChart, ming: Palace, patterns: Pattern[]) {
  const sanFangSet = sanFangAllStars(chart);
  const has = ['天机', '太阴', '天同', '天梁'].filter(s => sanFangSet.has(s));
  if (has.length !== 3) return; // 4 星齐由 detectJiYueTongLiang 处理
  // 避免和上面 detectJiYueTongLiang 重复（4 星齐的不进这里）
  const missing = ['天机', '太阴', '天同', '天梁'].filter(s => !sanFangSet.has(s));
  patterns.push({
    name: 'Cơ Nguyệt Đồng Lương Tam Tinh Hội',
    level: 'neutral',
    description: `Tam phương tứ chính hội tề ${has.join(', ')}, thiếu ${missing.join(', ')} chưa hội. Cơ Nguyệt Đồng Lương bất toàn cách, văn chất có mưu trí, nhưng độ ổn định không bằng tứ tinh tề hội. Vẫn hợp công chức, giáo dục nghiên cứu, y tế, phục vụ v.v cần tích lũy và ổn định, mấu chốt xem sự phối hợp của sao khuyết và Tứ Hóa.`,
    palaces: getSanFangPalaces(chart).filter(p => has.some(s => getMajorStarNames(p).includes(s))).map(p => p.name),
    conditions: { required: [`Tam phương tứ chính hội ${has.join(', ')} (Cơ Nguyệt Đồng Lương thiếu ${missing.join(', ')})`] },
    source: '《Tử Vi Đẩu Số Toàn Thư·Cơ Nguyệt Đồng Lương Cách》(Bản giảm cấp)',
  });
  void ming;
}

/** 昌曲同会：文昌+文曲都在命三方四正 */
function detectChangQuTongHui(chart: ZiweiChart, patterns: Pattern[]) {
  const sanFangSet = sanFangAllStars(chart);
  if (!sanFangSet.has('文昌') || !sanFangSet.has('文曲')) return;
  const ming = chart.palaces.find(p => p.branch === chart.mingGongBranch);
  if (!ming) return;
  const inMing = hasStar(ming, '文昌') && hasStar(ming, '文曲');
  patterns.push({
    name: inMing ? 'Xương Khúc tọa Mệnh' : 'Xương Khúc đồng hội',
    level: 'good',
    description: inMing
      ? 'Văn Xương Văn Khúc đồng nhập Mệnh Cung, chủ thông minh tuấn tú, văn chương lai láng, hợp văn học, giáo dục, viết lách, tư vấn. Kỵ nhất Hóa Kỵ —— Xương Khúc Hóa Kỵ chủ văn thư khế ước thua thiệt.'
      : 'Văn Xương Văn Khúc đồng hội tam phương tứ chính, chủ tài hoa hơn người, tài ăn nói văn chương đều tốt. Hợp làm ngành nghề cần diễn đạt và văn chương, có Hóa Khoa gia trì thì danh tiếng hiển hách.',
    palaces: ['命宫'],
    conditions: { required: ['Văn Xương, Văn Khúc đồng hội Mệnh Cung tam phương tứ chính'] },
    source: '《Tử Vi Đẩu Số Toàn Thư·Văn Tinh Luận》',
  });
}

/** 辅弼同会：左辅+右弼都在命三方四正 */
function detectFuBiTongHui(chart: ZiweiChart, patterns: Pattern[]) {
  const sanFangSet = sanFangAllStars(chart);
  if (!sanFangSet.has('左辅') || !sanFangSet.has('右弼')) return;
  patterns.push({
    name: 'Phụ Bật Đồng Hội',
    level: 'good',
    description: 'Tả Phụ Hữu Bật đồng hội Mệnh Cung tam phương tứ chính, chủ cả đời quý nhân không dứt, nhân duyên cực tốt. Rất hợp vị trí lãnh đạo và công việc hợp tác nhóm. Ni sư nói "Phụ Bật giáp Mệnh, bình sinh quý nhân đa" —— bạn không phải là mệnh đơn đả độc đấu, cần khéo dùng mạng lưới nhân tế.',
    palaces: ['命宫'],
    conditions: { required: ['Tả Phụ, Hữu Bật đồng hội Mệnh Cung tam phương tứ chính'] },
    source: '《Tử Vi Đẩu Số Toàn Thư·Phụ Bật Luận》',
  });
}

/** 魁钺同会：天魁+天钺都在命三方四正 */
function detectKuiYueTongHui(chart: ZiweiChart, patterns: Pattern[]) {
  const sanFangSet = sanFangAllStars(chart);
  if (!sanFangSet.has('天魁') || !sanFangSet.has('天钺')) return;
  patterns.push({
    name: 'Khôi Việt Đồng Hội',
    level: 'good',
    description: 'Thiên Khôi Thiên Việt đồng hội Mệnh Cung tam phương tứ chính, được "Thiên Ất quý nhân" gia trì, thời khắc mấu chốt luôn có quý nhân nâng đỡ. Ni sư nói "Khôi Việt giáp Mệnh, tất vi quý nhân" —— khi gặp khó khăn bên cạnh sẽ xuất hiện người đắc lực giúp đỡ, nên chủ động duy trì nhân mạch.',
    palaces: ['命宫'],
    conditions: { required: ['Thiên Khôi, Thiên Việt đồng hội Mệnh Cung tam phương tứ chính'] },
    source: '《Tử Vi Đẩu Số Toàn Thư·Khôi Việt Luận》',
  });
}

/** 科权双会：化科 + 化权 同会三方四正 */
function detectKeQuanShuangHui(chart: ZiweiChart, patterns: Pattern[]) {
  const sfPalaces = getSanFangPalaces(chart);
  let hasKe = false, hasQuan = false;
  for (const p of sfPalaces) {
    for (const s of p.stars) {
      if (s.type === 'major' && s.siHua === '科') hasKe = true;
      if (s.type === 'major' && s.siHua === '权') hasQuan = true;
    }
  }
  if (!hasKe || !hasQuan) return;
  patterns.push({
    name: 'Khoa Quyền Song Hội',
    level: 'good',
    description: 'Hóa Khoa + Hóa Quyền đồng hội tam phương tứ chính, chủ danh quyền song mỹ —— vừa có học thức/danh tiếng (Khoa), lại có sức kiểm soát (Quyền), hợp đi tuyến "chuyên gia quyền uy" (như bác sĩ, luật sư, giáo sư, cốt cán kỹ thuật), danh lợi song thu mà nền tảng vững chắc.',
    palaces: ['命宫'],
    conditions: { required: ['Hóa Khoa, Hóa Quyền đồng hội Mệnh Cung tam phương tứ chính'] },
    source: '《Tử Vi Đẩu Số Toàn Thư·Tứ Hóa Hội Chiếu》',
  });
}

// ────────────────── 主入口 ──────────────────
export function detectPatterns(chart: ZiweiChart): Pattern[] {
  const patterns: Pattern[] = [];
  const ming = chart.palaces.find(p => p.branch === chart.mingGongBranch);
  if (!ming) return patterns;

  // 上格
  detectJunChenQingHui(chart, ming, patterns);
  detectZiFu(chart, ming, patterns);
  detectFuXiangChaoYuan(chart, ming, patterns);
  detectYangLiangChangLu(chart, ming, patterns);
  detectHuoTanLingTan(chart, ming, patterns);
  detectWuTan(chart, ming, patterns);
  detectShaPoLang(chart, ming, patterns);
  detectJiYueTongLiang(chart, ming, patterns);

  // 中格
  detectLianXiang(chart, patterns);
  detectWuQiSha(chart, patterns);
  detectTongLiang(chart, patterns);
  detectRiYueTongGong(chart, patterns);
  detectRiYueJiaMing(chart, patterns);
  detectJuRiTongGong(chart, patterns);
  detectShiZhongYinYu(chart, ming, patterns);
  detectMingZhuChuHai(chart, ming, patterns);
  detectZiWeiInMing(chart, ming, patterns);

  // 助力格
  detectFuBiJiaMing(chart, patterns);
  detectChangQuJiaMing(chart, patterns);
  detectKuiYueJiaMing(chart, patterns);
  detectShuangLuChaoYuan(chart, ming, patterns);
  detectSanQiJiaHui(chart, patterns);
  detectHuaLuRuMing(chart, ming, patterns);

  // 恶格
  detectHuaJiRuMingQian(chart, patterns);
  detectYangTuoJiaJi(chart, patterns);
  detectHuoLingJiaMing(chart, patterns);
  detectKongJieJiaMing(chart, patterns);
  detectLianShaYang(chart, patterns);
  detectJuHuoYang(chart, patterns);
  detectLingChangTuoWu(chart, patterns);
  detectMaTouDaiJian(chart, ming, patterns);

  // 基础格局（提升识别覆盖率，让普通命盘也能识别 1-3 个）
  detectLuCunShouShen(chart, patterns);
  detectTianMaRuMing(chart, patterns);
  detectHuaLuRuCai(chart, patterns);
  detectHuaQuanRuGuan(chart, patterns);
  detectHuaKeRuMingShen(chart, patterns);
  detectJiYueTongLiangPartial(chart, ming, patterns);
  detectChangQuTongHui(chart, patterns);
  detectFuBiTongHui(chart, patterns);
  detectKuiYueTongHui(chart, patterns);
  detectKeQuanShuangHui(chart, patterns);

  return patterns;
}

// ────────────────── 命宫摘要（保持向后兼容）──────────────────
export function getMingGongSummary(chart: ZiweiChart): {
  stars: string[];
  keywords: string[];
  nature: string;
} {
  const mingPalace = chart.palaces.find(p => p.branch === chart.mingGongBranch);
  if (!mingPalace) return { stars: [], keywords: [], nature: '' };

  const majorStars = mingPalace.stars.filter(s => s.type === 'major');
  const starNames = majorStars.map(s => s.name);

  const keywordMap: Record<string, string[]> = {
    '紫微': ['Tôn quý', 'Độc lập', 'Lãnh đạo'],
    '天机': ['Trí tuệ', 'Cơ biến', 'Giỏi mưu'],
    '太阳': ['Dương cương', 'Quan quý', 'Khảng khái'],
    '武曲': ['Tài phú', 'Cương nghị', 'Quả đoán'],
    '天同': ['Ôn hòa', 'Hưởng phúc', 'Tùy duyên'],
    '廉贞': ['Tài nghệ', 'Đào hoa', 'Đa biến'],
    '天府': ['Tài khố', 'Điềm tĩnh', 'Bảo thủ'],
    '太阴': ['Nhu mỹ', 'Tài phú', 'Tinh tế'],
    '贪狼': ['Dục vọng', 'Đào hoa', 'Đa tài'],
    '巨门': ['Giỏi biện', 'Đa tư', 'Khẩu tài'],
    '天相': ['Phụ tá', 'Hành chính', 'Vững vàng'],
    '天梁': ['Ấm hộ', 'Y dược', 'Trưởng bối'],
    '七杀': ['Tướng tinh', 'Quả quyết', 'Cô khắc'],
    '破军': ['Khai sáng', 'Biến động', 'Phá cũ'],
  };

  const natureMap: Record<string, string> = {
    '紫微': 'Đế vương tinh', '天机': 'Trí tuệ tinh', '太阳': 'Quý nhân tinh',
    '武曲': 'Tài bạch tinh', '天同': 'Phúc đức tinh', '廉贞': 'Đào hoa tinh',
    '天府': 'Tài khố tinh', '太阴': 'Tài phú tinh', '贪狼': 'Đào hoa tinh',
    '巨门': 'Thị phi tinh', '天相': 'Ấn thụ tinh', '天梁': 'Ấm tí tinh',
    '七杀': 'Tướng soái tinh', '破军': 'Biến động tinh',
  };

  const keywords = starNames.flatMap(n => keywordMap[n] ?? []).slice(0, 5);
  const nature = starNames.length > 0 ? (natureMap[starNames[0]] ?? '') : 'Trống';

  return { stars: starNames, keywords, nature };
}
