'use client';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, useScroll, useTransform, useInView, AnimatePresence } from 'framer-motion';
import StarField from '@/components/StarField';
import { useTheme, type Theme } from '@/components/ThemeProvider';
import AnnouncementModal from '@/components/AnnouncementModal';

// ─── 滚动入场 wrapper ────────────────────────────────────
function FadeIn({
  children, delay = 0, y = 28, className = '',
}: {
  children: React.ReactNode; delay?: number; y?: number; className?: string;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  return (
    <motion.div ref={ref}
      initial={{ opacity: 0, y }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function WeakBoundary({ line }: { line: string }) {
  // 之前的版本有 1px 实线 + 12px 渐变阴影，主题切换时形成清晰横线很硬。
  // 改为更柔和的 24px 渐变 + 低 opacity，section 衔接更自然。
  return (
    <div className="absolute top-0 left-0 right-0 h-16 pointer-events-none"
      style={{ background: `linear-gradient(to bottom, ${line}, transparent)`, opacity: 0.45 }} />
  );
}

// ─── 主题切换按钮 ────────────────────────────────────────
function ThemeToggle() {
  const { theme, toggle } = useTheme();
  const isDark = theme === 'dark';
  return (
    <motion.button
      onClick={toggle}
      whileHover={{ scale: 1.1, rotate: 15 }}
      whileTap={{ scale: 0.9 }}
      aria-label={isDark ? 'Chế độ sáng' : 'Chế độ tối'}
      className="relative w-9 h-9 rounded-full flex items-center justify-center"
      style={{
        background: isDark
          ? 'linear-gradient(135deg, rgba(20,16,48,0.9), rgba(40,30,80,0.9))'
          : 'linear-gradient(135deg, rgba(255,240,180,0.9), rgba(255,220,120,0.9))',
        border: `1.5px solid ${isDark ? 'rgba(212,168,67,0.35)' : 'rgba(180,130,30,0.4)'}`,
        boxShadow: isDark
          ? '0 0 12px rgba(212,168,67,0.15), inset 0 1px 2px rgba(0,0,0,0.3)'
          : '0 0 12px rgba(255,200,60,0.3), inset 0 1px 2px rgba(255,255,255,0.5)',
        transition: 'background 0.4s ease, border-color 0.4s ease, box-shadow 0.4s ease',
      }}
    >
      <motion.div
        animate={{ rotate: isDark ? 0 : 180 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
        style={{ lineHeight: 1 }}
      >
        {isDark ? (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"
              fill="rgba(212,180,100,0.9)" stroke="rgba(212,168,67,0.5)" strokeWidth="1" />
          </svg>
        ) : (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="5" fill="rgba(200,140,20,0.95)" stroke="rgba(160,100,10,0.5)" strokeWidth="1" />
            <g stroke="rgba(200,140,20,0.7)" strokeWidth="1.5" strokeLinecap="round">
              <line x1="12" y1="1" x2="12" y2="3" />
              <line x1="12" y1="21" x2="12" y2="23" />
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
              <line x1="1" y1="12" x2="3" y2="12" />
              <line x1="21" y1="12" x2="23" y2="12" />
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
            </g>
          </svg>
        )}
      </motion.div>
    </motion.button>
  );
}

// ─── 主星数据 ────────────────────────────────────────────
const STARS = [
  { name: 'Tử Vi' }, { name: 'Thiên Cơ' }, { name: 'Thái Dương' }, { name: 'Vũ Khúc' },
  { name: 'Thiên Đồng' }, { name: 'Liêm Trinh' }, { name: 'Thiên Phủ' }, { name: 'Thái Âm' },
  { name: 'Tham Lang' }, { name: 'Cự Môn' }, { name: 'Thiên Tướng' }, { name: 'Thiên Lương' },
  { name: 'Thất Sát' }, { name: 'Phá Quân' },
];

// ─── 功能模块 ────────────────────────────────────────────
const FEATURES = [
  {
    tag: 'Hệ thống lập lá số',
    title: 'Ni Hải Hạ chính thống\nTử Vi Đẩu Số',
    subtitle: 'Không phải bản rút gọn, tuân thủ nghiêm ngặt theo truyền thừa của thầy Ni Hải Hạ',
    points: [
      'Dùng Âm Hành Ngũ Hành Cục khởi số, không dùng thuật toán rút gọn trên mạng',
      'Mệnh cung nghịch toán giờ sinh, Thân cung thuận toán giờ sinh, đúng theo quy tắc giảng dạy',
      '14 chính tinh và Tứ hóa phi tinh theo nguyên pháp suy diễn, cấu trúc hoàn chỉnh có thể kiểm chứng',
    ],
  },
  {
    tag: 'Trình bày lá số',
    title: '14 chính tinh hoàn chỉnh\nTứ hóa phi tinh',
    subtitle: 'Cấu trúc rõ ràng, nhìn một phát là thấy trục chính và điểm trọng tâm',
    points: [
      '14 chính tinh hoàn nhập cung, quan hệ chính tinh rõ ràng dễ đọc',
      'Phụ tinh và sát tinh hiển thị cùng màn hình, tránh thiếu thông tin quan trọng',
      'Phân cấp sáng tối: Miếu · Vượng · Lợi · Nhập, nhanh chóng nhận diện mạnh yếu',
      'Bấm vào bất kỳ chính tinh nào để xem giải đọc chi tiết của thầy Ni Hải Hạ',
    ],
  },
  {
    tag: 'AI giải đọc',
    title: 'Giải đọc sâu\nKhông chỉ là xem bói',
    subtitle: 'Cơ sở tri thức hệ thống Ni Hải Hạ × AI',
    points: [
      'Phân tích mệnh cách: Bắt đầu từ cung Mệnh chính tinh, kết hợp Tam phương Tứ chính, đưa ra đánh giá toàn diện về tính cách và cục diện cuộc đời',
      'Giải đọc 6 chiều: Hướng sự nghiệp, hôn nhân tình duyên, mô hình tài vận, chú ý sức khỏe, quan hệ gia đình, duyên phận con cái',
      'Theo dõi Đại hạn Lưu niên: Trọng tâm Đại hạn 10 năm hiện tại, gợi ý cụ thể cho cung Lưu niên năm nay và hành động cụ thể',
      'Tự do hỏi lại: Đặt câu hỏi trực tiếp với lá số của bạn, "Năm nay có đổi việc được không" "Khi nào vận duyên phận tốt nhất"',
    ],
  },
  {
    tag: 'Nhận diện cách cục',
    title: 'Tự động phát hiện\ncách cục lá số',
    subtitle: 'Từ tổ hợp sao phát hiện định mệnh của bạn',
    points: [
      'Tự động nhận diện 11 cách cục kinh điển: Tử Phủ đồng cung, Sát Phá Lang, Cơ Nguyệt Đồng Lương, Liêm Tướng, Vũ Khúc Thất Sát...',
      'Phụ Tướng giáp Mệnh, Nhật Nguyệt giáp Mệnh và các cách cục đặc biệt được phát hiện chính xác, kèm giải đọc chuẩn theo hệ thống Ni Hải Hạ',
      'Tứ hóa nhập Mệnh cung hoặc Diên cung được tự động đánh dấu, gợi ý các vấn đề cuộc đời cần chú ý',
      'Cách cục được phân tầng theo cấp độ cát hung, giúp bạn thấy rõ ưu điểm và thách thức trong lá số',
    ],
  },
];

// ─── 4 大学习板块（hero 后时间轴）──────────────────────────
const SECTIONS = [
  {
    key: 'ziwei',
    name: 'Tử Vi',
    en: 'Tử Vi',
    desc: '14 chính tinh · 13 cung · AI giải đọc',
    status: 'ready' as const,
    when: 'Tháng 5',
    icon: '◉',
    note: '',
  },
  {
    key: 'tianji',
    name: 'Thiên Kỷ',
    en: 'Thiên Kỷ',
    desc: 'Tử Vi · Kinh Dịch · Kỳ Môn Độn Giáp',
    status: 'soon' as const,
    when: 'Tháng 6',
    icon: '⊙',
    note: '',
  },
  {
    key: 'diji',
    name: 'Địa Kỷ',
    en: 'Địa Kỷ',
    desc: 'Nghiệp chưa hoàn thành của Ni Sư · Hậu bối phụ chú',
    status: 'soon' as const,
    when: 'Tháng 6',
    icon: '⊞',
    note: 'Nghiên cứu di thảo',
  },
  {
    key: 'renji',
    name: 'Nhân Kỷ',
    en: 'Nhân Kỷ',
    desc: 'Hoàng Đế Nội Kinh · Thương Hàn Luận · Kim Quy Yếu Lược · Châm Cứu',
    status: 'soon' as const,
    when: 'Tháng 7',
    icon: '⊕',
    note: '',
  },
];

// ─── 倪海夏核心教义 ──────────────────────────────────────
const NI_TEACHINGS = [
  {
    title: 'Mệnh cung là bản thể, Tam phương là dụng',
    body: 'Ni Sư luôn nhấn mạnh, xem mệnh trước hết phải xem Mệnh cung. Chính tinh Mệnh cung quyết định cục diện cơ bản và tính cách bẩm sinh của một người, Tam phương (Tài Bạch, Quan Lộc, Diên) thì quyết định「địa dụng võ」của người đó. Bốn cung liên động mới là bức tranh cuộc đời hoàn chỉnh.',
  },
  {
    title: 'Đối cung mượn sao, không được bỏ qua',
    body: 'Điểm độc đáo của Ni Sư là coi trọng「đối cung」. Bất kỳ cung nào nếu là cung không, phải mượn đối cung sao tinh để luận đoán, cung Mệnh đối diện là Diên cung, hai cung tương tác lẫn nhau, đây là điểm mà nhiều người mới dễ bỏ qua.',
  },
  {
    title: 'Tứ hóa mới là bàn tay của vận mệnh',
    body: 'Sao tinh chỉ là nền tảng, Tứ hóa (Hóa Lộc, Hóa Quyển, Hóa Khoa, Hóa Kỵ) mới là yếu tố quyết định vận may xấu tốt. Cùng một ngôi sao, có Hóa Lộc và có Hóa Kỵ, quỹ đạo cuộc đời có thể hoàn toàn khác nhau. Ni Sư nhấn mạnh: Không xem Tứ hóa, lá số chỉ giải được một nửa.',
  },
  {
    title: 'Đại hạn mười năm, vận có nhịp',
    body: 'Ni Sư chia cuộc đời thành 12 Đại hạn, mỗi Đại hạn 10 năm. Ông cho rằng con người ở các cung Đại hạn khác nhau, hoàn cảnh hoàn toàn khác. Hiểu mình đang đi Đại hạn nào, cung đó có sao tinh gì, mới thực sự nắm bắt được vận hạn hiện tại.',
  },
];

// ─── 主题色彩 helper ─────────────────────────────────────
function useColors() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  if (isDark) {
    return {
      bgBase:       '#07050c',
      navBg:        '#05030a',
      navBorder:    'rgba(200, 148, 42, 0.10)',
      goldGrad:     'linear-gradient(160deg, #7a5210 0%, #c8942a 30%, #f0d070 55%, #c8942a 75%, #7a5210 100%)',
      goldSolid:    '#c8942a',
      goldLine:     'rgba(200, 148, 42, 0.20)',
      tagText:      'rgba(200, 148, 42, 0.38)',
      textPrimary:  'rgba(240, 208, 112, 0.88)',
      textSecond:   'rgba(210, 195, 165, 0.82)',
      textMuted:    'rgba(200, 175, 120, 0.55)',
      textFaint:    'rgba(180, 155, 100, 0.38)',
      accent:       '#c8942a',
      accentSoft:   'rgba(200, 148, 42, 0.08)',
      cardBg:       'rgba(6, 4, 10, 0.98)',
      cardBorder:   'rgba(200, 148, 42, 0.10)',
      cardShadow:   '0 4px 24px rgba(0,0,0,0.5)',
      featureBg:    'rgba(12, 8, 4, 0.95)',
      featureBord:  'rgba(200, 148, 42, 0.10)',
      glowTint:     'rgba(200, 148, 42, 0.04)',
      glowBlue:     'rgba(100, 160, 248, 0.08)',
      glowPurple:   'rgba(120, 50, 180, 0.05)',
      niBg:         'rgba(10, 6, 4, 0.95)',
      niBorder:     'rgba(200, 148, 42, 0.15)',
      niDivider:    'rgba(200, 148, 42, 0.10)',
      niCardBg:     'rgba(10, 6, 4, 0.95)',
      niCardBord:   'rgba(200, 148, 42, 0.12)',
      niCardShadow: '0 2px 16px rgba(0,0,0,0.4)',
      starBg:       'rgba(200, 148, 42, 0.04)',
      starBorder:   'rgba(200, 148, 42, 0.12)',
      starText:     'rgba(240, 208, 112, 0.72)',
      ctaBg:        'linear-gradient(135deg, #5a3a08, #c8942a, #5a3a08)',
      ctaText:      '#f8f0d8',
      footerText:   'rgba(200, 148, 42, 0.25)',
      scrollLine:   'rgba(200, 148, 42, 0.30)',
      scrollText:   'rgba(200, 148, 42, 0.20)',
      altSection:   'rgba(200, 148, 42, 0.02)',
      quoteBg:      'rgba(10, 8, 16, 0.98)',
    };
  }

  // Light mode — Đông phương cổ điển
  return {
    bgBase:       '#F5EFE8',
    navBg:        'rgba(245, 239, 232, 0.95)',
    navBorder:    'rgba(92, 58, 46, 0.15)',
    goldGrad:     'linear-gradient(160deg, #4A2E22 0%, #5C3A2E 30%, #6B4A3A 55%, #5C3A2E 75%, #4A2E22 100%)',
    goldSolid:    '#5C3A2E',
    goldLine:     'rgba(92, 58, 46, 0.18)',
    tagText:      'rgba(92, 58, 46, 0.40)',
    textPrimary:  'rgba(61, 42, 30, 0.95)',
    textSecond:   'rgba(80, 55, 35, 0.85)',
    textMuted:    'rgba(110, 80, 50, 0.60)',
    textFaint:    'rgba(150, 115, 75, 0.38)',
    accent:       '#5C3A2E',
    accentSoft:   'rgba(92, 58, 46, 0.06)',
    cardBg:       'rgba(255, 252, 245, 0.95)',
    cardBorder:   'rgba(184, 169, 217, 0.20)',
    cardShadow:   '0 4px 24px rgba(92,58,46,0.08)',
    featureBg:    'rgba(250, 246, 238, 0.95)',
    featureBord:  'rgba(184, 169, 217, 0.18)',
    glowTint:     'rgba(184, 169, 217, 0.06)',
    glowBlue:     'rgba(100, 160, 248, 0.04)',
    glowPurple:   'rgba(184, 169, 217, 0.05)',
    niBg:         'rgba(252, 248, 240, 0.98)',
    niBorder:     'rgba(184, 169, 217, 0.20)',
    niDivider:    'rgba(92, 58, 46, 0.12)',
    niCardBg:     'rgba(255, 252, 245, 0.98)',
    niCardBord:   'rgba(184, 169, 217, 0.20)',
    niCardShadow: '0 2px 16px rgba(92,58,46,0.06)',
    starBg:       'rgba(92, 58, 46, 0.05)',
    starBorder:   'rgba(184, 169, 217, 0.20)',
    starText:     'rgba(80, 55, 35, 0.80)',
    ctaBg:        'linear-gradient(135deg, #4A2E22, #5C3A2E, #4A2E22)',
    ctaText:      '#FAF6EC',
    footerText:   'rgba(92, 58, 46, 0.40)',
    scrollLine:   'rgba(184, 169, 217, 0.25)',
    scrollText:   'rgba(92, 58, 46, 0.20)',
    altSection:   'rgba(184, 169, 217, 0.05)',
    quoteBg:      'rgba(250, 246, 238, 0.98)',
  };
}

// ─── 四化简介数据 ─────────────────────────────────────────
const SIHUA_BRIEF: Record<string, { attr: string; brief: string }> = {
  'Hóa Lộc': { attr: 'Cát hóa · Tăng ích', brief: 'Phú tinh đáo cung, chủ tài vận và phúc khí tăng ích. Cung vị sở tại sự vật thuận lợi, năng lực tăng cường, là hóa tinh được hoan nghênh nhất trong lá số.' },
  'Hóa Quyền': { attr: 'Cát hóa · Quyền uy', brief: 'Quyền lực tinh đáo cung, chủ nắm giữ và lãnh đạo lực. Cung vị sở tại chủcường thế và quyết đoán, hỷ nhập Quan Lộc cung và Mệnh cung, chủ sự nghiệp có thực quyền.' },
  'Hóa Khoa': { attr: 'Cát hóa · Danh dự', brief: 'Khoa danh tinh đáo cung, chủ thanh danh và quý nhân duyên. Cung vị sở tại chủ văn danh và khảo vận, có quý nhân phù trì, nghi học thuật, khảo thí và hội trường công khai.' },
  'Hóa Kỵ': { attr: 'Hung hóa · Chướng ngại', brief: 'Kiếp số tinh đáo cung, chủ chấp niệm và chướng ngại. Cung vị sở tại cần đặc biệt chú ý, vấn đề nhân sinh sẽ trở thành thử thách quan trọng.' },
};

// ─── 主星简介数据 ─────────────────────────────────────────
const STAR_BRIEF: Record<string, { attr: string; brief: string }> = {
  'Tử Vi': { attr: 'Thổ · Đế vương', brief: 'Sao quý nhất trong Tử Vi, thống ngự các sao. Mệnh nhân có khí cô ngạo, chủ uy quyền hiển đạt, bẩm sinh có khí chất lãnh đạo, phù hợp vị trí lãnh đạo độc đương nhất diện.' },
  'Thiên Cơ': { attr: 'Mộc · Trí tuệ', brief: 'Sao trường thọ, chủ mưu lược và biến động. Thông tuệ linh hoạt, thiện mưu lược, tâm tư tế nhị, hợp làm lập hoạch, cố vấn, kỹ thuật.' },
  'Thái Dương': { attr: 'Hỏa · Quan Lộc chủ', brief: 'Sao Quan Lộc, chủ thanh danh và danh vọng. Hào phóng độ lượng, coi trọng hình tượng công chúng, lợi quan trường và công chức, nam mệnh lực mạnh, nhập miếu thì quang minh lỗi lạc.' },
  'Vũ Khúc': { attr: 'Kim · Tài bạc chủ', brief: 'Sao tài bạc, chủ tài chính và quyết đoán. Ý chí kiên định, hành động quả cảm, hợp tài chính, tài chính, quân cảnh, là sao cô khắc, lợi hôn nhân trễ.' },
  'Thiên Đồng': { attr: 'Thủy · Phúc tinh', brief: 'Sao Phúc Đức, chủ hưởng lạc và nhân duyên. Tính tình ôn hòa, nhân duyên cực tốt, coi trọng phẩm chất sống, tình cảm tế nhị, vận thế tuổi già tốt.' },
  'Liêm Trinh': { attr: 'Hỏa · Tài nghệ tinh', brief: 'Sao thứ đào hoa, chủ tài nghệ và tình dục. Tài hoa xuất chúng, tình cảm phong phú, hợp nghệ thuật, chính giới, đa tài đa nghệ nhưng cần đề phòng đào hoa thị phi.' },
  'Thiên Phủ': { attr: 'Thổ · Tài khố tinh', brief: 'Sao Nam Đẩu, chủ tài khố và tích lũy. Ổn trọng bảo thủ, lý tài năng lực mạnh, là sức mạnh ổn định của lá số, hợp quản lý tài chính và hành chính.' },
  'Thái Âm': { attr: 'Thủy · Điền trạch chủ', brief: 'Sao Điền trạch, chủ tài phú và âm nhu. Tế nhị ôn nhu, cảm nhận lực mạnh, nữ mệnh càng tốt, lợi bất động sản và tích lũy, hợp văn nghệ hoặc dịch vụ.' },
  'Tham Lang': { attr: 'Mộc Thủy · Đào hoa', brief: 'Sao đào hoa, chủ dục vọng và tài nghệ. Đa tài đa nghệ, dục vọng cường thịnh, xã giao hoạt bát, hợp nghệ thuật, quan hệ công chúng, kinh doanh, nhân duyên cực tốt.' },
  'Cự Môn': { attr: 'Thủy · Thị phi tinh', brief: 'Sao tối, chủ khẩu tài và thị phi. Khẩu tài xuất chúng, tư biện năng lực mạnh, hợp luật sư, giáo dục, truyền thông, cần chú ý khẩu thiệt thị phi, lấy biện tài lập thân.' },
  'Thiên Tướng': { attr: 'Thủy · Ấn tinh', brief: 'Sao Ấn, chủ phụ tá và ấn thụ. Thiện điều phối, coi trọng lễ tiết, chính trực thủ pháp, hợp làm phụ tá, hành chính, pháp luật, quý nhân vận gia.' },
  'Thiên Lương': { attr: 'Thổ · Ân tinh', brief: 'Sao Ân, chủ lão thành và ân bế. Chính trực ổn trọng, từ bi tâm mạnh, ông trời sẽ phù hộ, hợp y tế, xã hội công tác, tôn giáo lĩnh vực.' },
  'Thất Sát': { attr: 'Kim Hỏa · Tướng tinh', brief: 'Sao Tướng, chủ cương liệt và khai sáng. Tính cách cương nghị, hành động lực mạnh, dũng cảm khiêu chiến, hợp sáng nghiệp, quân cảnh, cạnh tranh ngành, hung hóa cát.' },
  'Phá Quân': { attr: 'Thủy · Hào tinh', brief: 'Sao Hào, chủ biến động và khai phá. Dũng cảm đột phá, không sợ thay đổi, một đời biến động lớn nhưng có phách lực, hợp khai thác công tác, đi con đường người khác chưa đi.' },
};

// ─── 功能视觉装饰 ────────────────────────────────────────
function FeatureVisual({ index, colors: c }: { index: number; colors: ReturnType<typeof useColors> }) {
  if (index === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-5">
        <div className="grid grid-cols-4 gap-1.5 w-72 mx-auto">
          {Array.from({ length: 16 }).map((_, i) => {
            const isCenter = [5, 6, 9, 10].includes(i);
            const isActive = [0, 3, 12, 15].includes(i);
            return (
              <motion.div key={i}
                initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}
                transition={{ delay: i * 0.03 }}
                className="h-14 rounded-sm flex items-center justify-center text-xs transition-all duration-300"
                style={{
                  border: `1px solid ${isActive ? c.goldLine : c.cardBorder}`,
                  background: isCenter ? 'transparent' : isActive ? c.starBg : c.featureBg,
                  color: isActive ? c.goldSolid : c.textFaint,
                  opacity: isCenter ? 0 : 1,
                }}>
                {isActive ? '★' : ''}
              </motion.div>
            );
          })}
        </div>
        <p className="text-[10px] tracking-widest transition-colors duration-300"
          style={{ color: c.textFaint }}>Phương pháp lập lá số Ni Hải Hạ</p>
      </div>
    );
  }

  if (index === 1) {
    const [sel, setSel] = useState<string | null>(null);
    const selInfo = sel ? (STAR_BRIEF[sel] ?? SIHUA_BRIEF[sel] ?? null) : null;
    return (
      <div className="flex flex-col gap-4 h-full justify-center">
        {[
          { group: 'Hệ Tử Vi', stars: ['Tử Vi', 'Thiên Cơ', 'Thái Dương', 'Vũ Khúc', 'Thiên Đồng', 'Liêm Trinh'] },
          { group: 'Hệ Thiên Phủ', stars: ['Thiên Phủ', 'Thái Âm', 'Tham Lang', 'Cự Môn', 'Thiên Tướng', 'Thiên Lương', 'Thất Sát', 'Phá Quân'] },
        ].map(group => (
          <div key={group.group}>
            <div className="text-[11px] tracking-widest mb-2 transition-colors duration-300"
              style={{ color: c.textFaint }}>{group.group}</div>
            <div className="flex flex-wrap gap-1.5">
              {group.stars.map(s => (
                <motion.button key={s}
                  onClick={() => setSel(sel === s ? null : s)}
                  whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.95 }}
                  transition={{ duration: 0.1 }}
                  className="text-xs px-2 py-1 rounded-md cursor-pointer"
                  style={{
                    border: `1px solid ${sel === s ? c.goldSolid : c.goldLine}`,
                    color: c.goldSolid,
                    background: sel === s ? `${c.goldLine}30` : 'transparent',
                    fontWeight: sel === s ? 600 : 400,
                  }}>
                  {s}
                </motion.button>
              ))}
            </div>
          </div>
        ))}
        <div>
          <div className="text-[11px] tracking-widest mb-2 transition-colors duration-300"
            style={{ color: c.textFaint }}>Tứ hóa phi tinh</div>
          <div className="flex gap-2 flex-wrap">
            {[['Hóa Lộc', 'rgba(52,211,153,0.7)'], ['Hóa Quyền', 'rgba(96,165,250,0.7)'], ['Hóa Khoa', 'rgba(250,204,21,0.7)'], ['Hóa Kỵ', 'rgba(248,113,113,0.7)']].map(([label, color]) => (
              <motion.button key={label}
                onClick={() => setSel(sel === label ? null : label)}
                whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.1 }}
                className="text-xs px-2.5 py-1 rounded-md cursor-pointer"
                style={{
                  border: `1px solid ${color}`,
                  color,
                  background: sel === label ? `${color.replace('0.7', '0.15')}` : 'transparent',
                  fontWeight: sel === label ? 600 : 400,
                }}>
                {label}
              </motion.button>
            ))}
          </div>
        </div>
        <AnimatePresence mode="wait">
          {selInfo && (
            <motion.div key={sel}
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="rounded-xl p-4 mt-1.5"
              style={{ border: `1px solid ${c.goldLine}`, background: c.featureBg }}>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-sm font-semibold" style={{ color: c.goldSolid }}>{sel}</span>
                <span className="text-[11px] px-2 py-0.5 rounded-full" style={{ color: c.tagText, border: `1px solid ${c.goldLine}` }}>{selInfo.attr}</span>
              </div>
              <p className="text-xs leading-relaxed" style={{ color: c.textSecond }}>{selInfo.brief}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  if (index === 2) {
    const msgs = [
      { role: 'user', text: 'Năm nay vận sự nghiệp của tôi thế nào?' },
      { role: 'ai', text: 'Cung Mệnh Thiên Cơ hóa Lộc, năm nay Đại hạn đi cung Quan Lộc, Tam phương có sao phù trợ, sự nghiệp có quý nhân hỗ trợ, thích hợp chủ động mở rộng…' },
      { role: 'user', text: 'Khi nào vận tình cảm tốt nhất?' },
    ];
    return (
      <div className="flex flex-col gap-2 h-full justify-center">
        {msgs.map((m, i) => (
          <motion.div key={i}
            initial={{ opacity: 0, x: m.role === 'user' ? 10 : -10 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.15 }}
            className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className="max-w-[85%] text-[11px] px-3 py-2 rounded-lg leading-relaxed"
              style={{
                border: `1px solid ${m.role === 'user' ? c.goldLine : c.cardBorder}`,
                background: m.role === 'user' ? c.starBg : c.featureBg,
                color: m.role === 'user' ? c.goldSolid : c.textSecond,
              }}>
              {m.text}
            </div>
          </motion.div>
        ))}
      </div>
    );
  }

  if (index === 3) {
    const patterns = [
      { name: 'Sát Phá Lang', desc: 'Cách cục sáng tạo tiến thủ', ok: true },
      { name: 'Liêm Tướng',   desc: 'Cách cục hành chính ấn thụ', ok: true },
      { name: 'Hóa Kỵ nhập Mệnh', desc: 'Cần chú ý vấn đề tâm lý', ok: false },
    ];
    return (
      <div className="flex flex-col gap-3 h-full justify-center">
        {patterns.map((p, i) => (
          <motion.div key={i}
            initial={{ opacity: 0, x: -10 }} whileInView={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.12 }}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg"
            style={{
              border: `1px solid ${p.ok ? 'rgba(96,165,250,0.25)' : 'rgba(251,146,60,0.25)'}`,
              background: p.ok ? 'rgba(96,165,250,0.05)' : 'rgba(251,146,60,0.05)',
            }}>
            <div className="w-1.5 h-1.5 rounded-full flex-shrink-0"
              style={{ background: p.ok ? 'rgba(96,165,250,0.6)' : 'rgba(251,146,60,0.6)' }} />
            <div>
              <div className="text-[11px] font-medium"
                style={{ color: p.ok ? 'rgba(147,197,253,0.8)' : 'rgba(253,186,116,0.8)' }}>{p.name}</div>
              <div className="text-[10px]" style={{ color: c.textMuted }}>{p.desc}</div>
            </div>
          </motion.div>
        ))}
        <div className="text-[9px] mt-2 tracking-wider text-center" style={{ color: c.textFaint }}>
          Tự động nhận diện 11 cách cục kinh điển
        </div>
      </div>
    );
  }

  return null;
}

// ─── 主页 ─────────────────────────────────────────────────
export default function HomePage() {
  const router = useRouter();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const c = useColors();

  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroY = useTransform(scrollYProgress, [0, 1], ['0%', '28%']);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.55], [1, 0]);

  // 把 body / html 背景同步到 home 主题色，消除半透明 nav 透出 #fafaf9 的色差
  // useLayoutEffect 保证在浏览器绘制前同步更新，避免与根 div 的 transition 不同步
  useLayoutEffect(() => {
    document.documentElement.style.background = c.bgBase;
    document.body.style.background = c.bgBase;
    return () => {
      document.documentElement.style.background = '';
      document.body.style.background = '';
    };
  }, [c.bgBase]);

  return (
    <div style={{
      background: c.bgBase,
      transition: 'background 0.35s ease',
      border: isDark ? 'none' : '1px solid rgba(184,169,217,0.35)',
      borderRadius: isDark ? '0' : '16px',
      margin: isDark ? '0' : '8px',
      minHeight: isDark ? 'auto' : 'calc(100vh - 16px)',
    }} className="overflow-x-hidden">
      {/* 致用户公告——首次访问全屏覆盖，关闭后才进入首页 */}
      <AnnouncementModal />

      {isDark && <StarField />}

      {/* 全局光晕 */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] rounded-full"
          style={{ background: `radial-gradient(ellipse, ${c.glowTint} 0%, transparent 70%)` }} />
        <div className="absolute top-1/3 left-1/4 w-96 h-96 rounded-full"
          style={{ background: `radial-gradient(ellipse, ${c.glowBlue} 0%, transparent 70%)` }} />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full"
          style={{ background: `radial-gradient(ellipse, ${c.glowPurple} 0%, transparent 70%)` }} />
      </div>

      {/* ── Ink wash background for header ── */}
      <div className="fixed top-0 left-0 right-0 h-20 pointer-events-none z-40"
        style={{
          background: isDark
            ? 'linear-gradient(to bottom, rgba(7,5,12,0.8), transparent)'
            : 'linear-gradient(to bottom, rgba(92,58,46,0.08), transparent)',
          opacity: 0.6,
        }} />

      {/* ── Header ── nav với ink wash nền mờ, logo trái, home/menu phải ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 gap-2"
        style={{ background: isDark ? 'rgba(5,3,10,0.7)' : 'rgba(245,239,232,0.85)', backdropFilter: 'blur(8px)' }}>
        {/* Logo trái */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-[11px] sm:text-xs tracking-[0.3em] sm:tracking-[0.4em] font-medium"
            style={{ color: isDark ? 'rgba(212,168,67,0.85)' : '#5C3A2E' }}>
            Tử Vi Đẩu Số
          </span>
        </div>

        {/* Home + Menu + Hợp bàn phải */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Home icon */}
          <motion.button
            whileHover={{ scale: 1.1, rotate: 10 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => router.push('/')}
            aria-label="Trang chủ"
            className="p-2 rounded-lg transition-colors"
            style={{
              background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(92,58,46,0.06)',
              border: isDark ? '1px solid rgba(212,168,67,0.15)' : '1px solid rgba(92,58,46,0.12)',
              color: isDark ? 'rgba(212,168,67,0.7)' : '#5C3A2E',
            }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
          </motion.button>

          {/* Hợp bàn */}
          <motion.button
            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            onClick={() => router.push('/heming')}
            className="text-[11px] sm:text-xs px-3 py-1.5 rounded-full transition-all duration-300 hidden sm:inline-flex"
            style={{
              background: isDark ? 'rgba(212,168,67,0.08)' : 'rgba(92,58,46,0.08)',
              border: isDark ? '1px solid rgba(212,168,67,0.2)' : '1px solid rgba(92,58,46,0.2)',
              color: isDark ? 'rgba(212,168,67,0.85)' : '#5C3A2E',
            }}>
            Hợp bàn
          </motion.button>

          {/* Theme toggle */}
          <ThemeToggle />

          {/* Hamburger menu */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            aria-label="Menu"
            className="p-2 rounded-lg transition-colors"
            style={{
              background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(92,58,46,0.06)',
              border: isDark ? '1px solid rgba(212,168,67,0.15)' : '1px solid rgba(92,58,46,0.12)',
              color: isDark ? 'rgba(212,168,67,0.7)' : '#5C3A2E',
            }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </motion.button>
        </div>
      </nav>

      {/* ══ HERO ══════════════════════════════════════════ */}
      <section ref={heroRef} className="relative min-h-[82svh] lg:min-h-[92vh] flex flex-col items-center justify-center px-6 z-10 pb-24 pt-10">
        <motion.div style={{ y: heroY, opacity: heroOpacity, maxWidth: '960px' }} className="text-center w-full mx-auto mt-10">
          {/* 标签行 */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="flex items-center justify-center gap-3 mb-8">
            <div className="h-px w-12" style={{ background: `linear-gradient(to right, transparent, ${c.goldLine})` }} />
            <span className="text-[11px] tracking-[0.45em] transition-colors duration-300" style={{ color: c.tagText }}>
              Tử Vi Đẩu Số · Hệ thống Ni Hải Hạ
            </span>
            <div className="h-px w-12" style={{ background: `linear-gradient(to left, transparent, ${c.goldLine})` }} />
          </motion.div>

          {/* 主标题 */}
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
            style={{ position: 'relative', display: 'inline-block' }}>
            <h1
              className={`grad-text grad-text-dark font-bold leading-none mb-5`}
              style={{
                fontSize: 'clamp(56px, 10vw, 124px)',
                letterSpacing: '0.07em',
                fontFamily: isDark ? undefined : '"Ma Shan Zheng", "ZCOOL XiaoWei", cursive',
              }}>
              Lá Số Tử Vi
            </h1>
          </motion.div>

          <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.45 }}
            className="text-base md:text-lg tracking-[0.18em] mb-2"
            style={{ color: c.textSecond, fontWeight: 500 }}>
            Tử Vi làm cửa · Thiên Địa Nhân làm đường · Ni Hải Hạ làm thầy
          </motion.p>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.55 }}
            className="text-xs md:text-sm tracking-[0.3em] mb-6"
            style={{ color: c.textMuted, opacity: 0.85 }}>
            AI giải đáp · Tri hành hợp nhất
          </motion.p>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.65 }}
            className="text-sm max-w-xl mx-auto leading-relaxed mb-10"
            style={{ color: c.textMuted }}>
            Nhập ngày giờ sinh, tạo lá số Tử Vi Đẩu Số riêng — các modules học Thiên Kỷ, Địa Kỷ, Nhân Kỷ sẽ từ từ mở ra.
          </motion.p>

          {/* CTA */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.85 }}
            className="flex flex-col items-center gap-4">
            <motion.button
              whileHover={{ y: -2, filter: 'brightness(1.06)' }} whileTap={{ scale: 0.97 }}
              onClick={() => router.push('/chart')}
              className="px-12 py-4 font-semibold text-base tracking-widest rounded-full"
              style={{ background: c.ctaBg, color: c.ctaText }}>
              Tạo lá số ngay
            </motion.button>
          </motion.div>

          {/* 十四主星 */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            transition={{ delay: 1.05, duration: 0.8 }}
            className="mt-12 grid grid-cols-7 gap-1.5 max-w-[540px] mx-auto">
            {STARS.map((star, i) => (
              <motion.div key={star.name}
                initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.05 + i * 0.03, duration: 0.35 }}
                className="flex items-center justify-center px-2 py-1 rounded-full"
                style={{ background: c.starBg, border: `1px solid ${c.starBorder}` }}>
                <span className="text-[11px] tracking-wide" style={{ color: c.starText }}>{star.name}</span>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* 上线公告便利贴 — 桌面端绝对定位右侧 */}
        <motion.div
          initial={{ opacity: 0, x: 30, rotate: 0 }}
          animate={{ opacity: 1, x: 0, rotate: -4 }}
          transition={{ delay: 1.4, duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
          className="absolute hidden lg:block pointer-events-none"
          style={{
            right: 'clamp(2%, 6vw, 8%)',
            top: '54%',
            maxWidth: '240px',
          }}
        >
          <div style={{
            background: 'linear-gradient(135deg, #fff5e3 0%, #ffe1c0 100%)',
            border: '2px dashed rgba(232,132,62,0.45)',
            borderRadius: '16px',
            padding: '14px 18px',
            boxShadow: '0 8px 24px rgba(196,90,45,0.18), 0 2px 6px rgba(196,90,45,0.1)',
            fontFamily: '"PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif',
          }}>
            <div style={{ fontSize: '20px', marginBottom: '6px', lineHeight: 1 }}>🎁</div>
            <div style={{ fontSize: '13px', lineHeight: 1.7, color: '#8b3a1a', fontWeight: 500 }}>
              <span style={{ color: '#c45a2d', fontWeight: 700, fontSize: '14px' }}>5/1 — 5/8</span>
              <span> Ưu đãi giới hạn</span>
            </div>
            <div style={{ fontSize: '13px', lineHeight: 1.7, color: '#8b3a1a', fontWeight: 500 }}>
              Tất cả tính năng + AI hỏi đáp
              <strong style={{ color: '#c45a2d' }}> Hoàn toàn miễn phí</strong>
            </div>
          </div>
        </motion.div>

        {/* 上线公告便利贴 — 手机端正常流式显示（hero 内容下方居中） */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0, rotate: -2 }}
          transition={{ delay: 1.4, duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
          className="lg:hidden mx-auto mt-8 mb-2 pointer-events-none"
          style={{
            maxWidth: 'min(280px, 84vw)',
          }}
        >
          <div style={{
            background: 'linear-gradient(135deg, #fff5e3 0%, #ffe1c0 100%)',
            border: '2px dashed rgba(232,132,62,0.45)',
            borderRadius: '14px',
            padding: '12px 16px',
            boxShadow: '0 6px 18px rgba(196,90,45,0.16), 0 2px 4px rgba(196,90,45,0.08)',
            fontFamily: '"PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: '18px', marginBottom: '4px', lineHeight: 1 }}>🎁</div>
            <div style={{ fontSize: '12px', lineHeight: 1.7, color: '#8b3a1a', fontWeight: 500 }}>
              <span style={{ color: '#c45a2d', fontWeight: 700, fontSize: '13px' }}>5/1 — 5/8</span>
              <span> Ưu đãi giới hạn</span>
            </div>
            <div style={{ fontSize: '12px', lineHeight: 1.7, color: '#8b3a1a', fontWeight: 500 }}>
              Tất cả tính năng + AI <strong style={{ color: '#c45a2d' }}>Miễn phí</strong>
            </div>
          </div>
        </motion.div>

        {/* 滚动提示（绝对定位，不影响 hero opacity 计算） */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 1 }}
          className="absolute bottom-6 left-0 right-0 flex flex-col items-center gap-2 pointer-events-none">
          <span className="text-[9px] tracking-[0.4em] uppercase" style={{ color: c.scrollText }}>Khám phá thêm</span>
          <motion.div animate={{ y: [0, 6, 0] }} transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
            className="w-px h-8" style={{ background: `linear-gradient(to bottom, ${c.scrollLine}, transparent)` }} />
        </motion.div>
      </section>

        {/* ══ 哲学引言 ══════════════════════════════════════ */}
      <section className="relative z-10 overflow-hidden min-h-[82svh] lg:min-h-[92vh] flex items-center" style={{ padding: '72px 24px' }}>
        <WeakBoundary line={c.navBorder} />
        <div className="absolute inset-0"
          style={{
            background: 'linear-gradient(to bottom, #07050c 0%, #07050c 6%, #0a0810 22%, #0d0820 40%, #0a0618 68%, #0a0810 86%, #07050c 100%)',
            transition: 'background 0.4s ease',
          }} />
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden">
          <span className="font-bold" style={{ fontSize: 'clamp(220px, 38vw, 460px)', color: 'rgba(212,168,67,0.012)', lineHeight: 1, fontFamily: 'serif' }}>Mệnh</span>
        </div>
        <FadeIn className="relative mx-auto text-center w-full" y={20}>
          <div className="flex items-center justify-center gap-4 mb-8">
            <div className="h-px w-16" style={{ background: 'linear-gradient(to right, transparent, rgba(212,168,67,0.45))' }} />
            <span className="text-[10px] tracking-[0.55em] uppercase" style={{ color: 'rgba(212,168,67,0.5)' }}>Mệnh · Vận · Quan</span>
            <div className="h-px w-16" style={{ background: 'linear-gradient(to left, transparent, rgba(212,168,67,0.45))' }} />
          </div>
          <div className="space-y-3" style={{ maxWidth: '840px', margin: '0 auto' }}>
            {[
              { text: 'Ý nghĩa của việc khám phá vận mệnh trước', size: 'clamp(17px, 2.2vw, 28px)', color: 'rgba(215,228,252,0.72)', delay: 0.1 },
              { text: 'Không phải ở việc biết trước tương lai', size: 'clamp(21px, 2.6vw, 32px)', color: 'rgba(220,232,250,0.74)', delay: 0.25 },
              { text: 'Mà ở việc không ngừng nhận ra bản thân', size: 'clamp(24px, 3vw, 40px)', color: 'rgba(218,230,248,0.8)', delay: 0.34 },
            ].map((line, i) => (
              <motion.p key={i}
                initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: line.delay }}
                className="tracking-wider" style={{ fontSize: line.size, color: line.color, fontWeight: 400 }}>
                {line.text}
              </motion.p>
            ))}
            <motion.p
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.45 }}
              className={`grad-text grad-text-dark font-bold`}
              style={{ fontSize: 'clamp(24px, 3.4vw, 48px)', letterSpacing: '0.05em', lineHeight: 1.35 }}>
              Cuối cùng viết nên kịch bản cuộc đời của chính mình
            </motion.p>
          </div>
        </FadeIn>
      </section>

      {/* ══ 4 大学习板块时间轴 ════════════════════════════ */}
      <section className="relative z-10 py-20 lg:py-24 px-6"
        style={{
          background: 'linear-gradient(to bottom, transparent 0%, rgba(200,148,42,0.03) 50%, transparent 100%)',
        }}>
        <FadeIn className="text-center mb-14">
          <div className="flex items-center justify-center gap-3 mb-3">
            <div className="h-px w-12" style={{ background: `linear-gradient(to right, transparent, ${c.goldLine})` }} />
            <span className="text-[10px] tracking-[0.4em] uppercase" style={{ color: c.goldSolid, opacity: 0.7 }}>Curriculum</span>
            <div className="h-px w-12" style={{ background: `linear-gradient(to left, transparent, ${c.goldLine})` }} />
          </div>
          <div className="text-2xl lg:text-3xl font-bold mb-2 tracking-[0.15em]" style={{ color: c.textPrimary }}>
            Phương pháp luận của Ni Sư · Từ từ mở ra
          </div>
          <div className="text-xs lg:text-sm tracking-[0.1em]" style={{ color: c.textMuted }}>
            Bắt đầu từ Tử Vi, dần mở các modules Thiên Kỷ / Địa Kỷ / Nhân Kỷ
          </div>
        </FadeIn>

        <div className="max-w-sm lg:max-w-5xl mx-auto relative">
          {/* 横向连接线（仅桌面）*/}
          <div className="hidden lg:block absolute top-7 left-[12.5%] right-[12.5%] h-0.5"
            style={{
              background: `linear-gradient(90deg, ${c.goldSolid} 0%, ${c.goldSolid} 25%, ${c.goldLine} 25%)`,
              opacity: 0.6,
            }} />

          {/* 纵向连接线（仅手机）—— 圆点贴在线上，做"地铁线路图"风格 */}
          <div className="lg:hidden absolute left-7 top-7 bottom-7 w-px -translate-x-1/2"
            style={{
              background: `linear-gradient(180deg, ${c.goldSolid} 0%, ${c.goldSolid} 22%, ${c.goldLine} 22%)`,
              opacity: 0.6,
            }} />

          <div className="flex flex-col gap-5 lg:grid lg:grid-cols-4 lg:gap-4">
            {SECTIONS.map((s, i) => {
              const ready = s.status === 'ready';
              return (
                <motion.div key={s.key}
                  initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.15, duration: 0.5 }}
                  viewport={{ once: true }}
                  className="relative flex flex-row lg:flex-col items-center lg:items-center text-left lg:text-center gap-4 lg:gap-0">
                  {/* 节点圆 */}
                  <div className="relative w-14 h-14 shrink-0 rounded-full flex items-center justify-center lg:mb-3"
                    style={{
                      background: ready
                        ? `linear-gradient(135deg, ${c.goldSolid} 0%, ${c.goldSolid}cc 100%)`
                        : 'rgba(200,148,42,0.05)',
                      border: ready ? 'none' : `2px dashed ${c.goldLine}`,
                      color: ready ? '#fff' : c.textMuted,
                      boxShadow: ready ? `0 4px 16px ${c.goldSolid}55` : 'none',
                    }}>
                    <span className="text-2xl">{s.icon}</span>
                    {ready && (
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[10px] text-white"
                        style={{ background: '#10b981', boxShadow: '0 2px 6px rgba(16,185,129,0.4)' }}>
                        ✓
                      </div>
                    )}
                  </div>
                  {/* 文字组：手机端右排单列；桌面端居中堆叠 */}
                  <div className="flex-1 lg:flex-none flex flex-col items-start lg:items-center min-w-0">
                    {/* 顶行：时间标签 + 板块名 + note（手机端 inline；桌面端依然分行） */}
                    <div className="flex items-baseline gap-2 lg:flex-col lg:gap-0 lg:mb-1">
                      <div className="text-[10px] tracking-[0.25em] lg:mb-1.5"
                        style={{ color: ready ? '#10b981' : c.textMuted, fontWeight: 500 }}>
                        {s.when}
                      </div>
                      <div className="text-base lg:text-xl font-semibold tracking-[0.15em]"
                        style={{ color: c.textPrimary }}>
                        {s.name}
                      </div>
                      {s.note && (
                        <div className="text-[9px] tracking-[0.15em] px-2 py-0.5 rounded-full lg:hidden"
                          style={{
                            color: c.goldSolid,
                            background: 'rgba(200,148,42,0.08)',
                            border: `1px solid ${c.goldLine}`,
                            opacity: 0.85,
                          }}>
                          {s.note}
                        </div>
                      )}
                    </div>
                    {/* 桌面专属 note（手机已在顶行 inline 展示）*/}
                    {s.note && (
                      <div className="hidden lg:block text-[9px] tracking-[0.15em] mb-1.5 px-2 py-0.5 rounded-full"
                        style={{
                          color: c.goldSolid,
                          background: 'rgba(200,148,42,0.08)',
                          border: `1px solid ${c.goldLine}`,
                          opacity: 0.85,
                        }}>
                        {s.note}
                      </div>
                    )}
                    {/* 简介 */}
                    <div className="text-[11px] lg:text-xs leading-relaxed lg:max-w-[200px] mt-0.5 lg:mt-0"
                      style={{ color: c.textSecond }}>
                      {s.desc}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══ 功能详解 ══════════════════════════════════════ */}
      <section className="relative z-10">
        {FEATURES.map((feature, i) => (
          <div key={i}
            className={`flex items-center px-6 md:px-10 lg:px-14 py-20 md:py-24 ${i <= 2 ? 'min-h-[82svh] lg:min-h-[92vh]' : ''}`}
            style={{ background: i % 2 === 1 ? c.altSection : 'transparent' }}>
            <div className="mx-auto w-full" style={{ maxWidth: '1280px' }}>
              <div className={`grid grid-cols-1 ${i % 2 === 0 ? 'lg:grid-cols-[0.45fr_0.55fr]' : 'lg:grid-cols-[0.55fr_0.45fr]'} gap-10 lg:gap-16 items-start ${i % 2 === 1 ? 'lg:grid-flow-dense' : ''}`}>
                {/* 文字区 */}
                <div className={i % 2 === 1 ? 'lg:col-start-2' : ''}>
                  <FadeIn delay={0}>
                    <div className="flex items-center gap-3 mb-6">
                      <div className="h-px w-8" style={{ background: c.goldLine }} />
                      <span className="text-[10px] tracking-[0.5em] uppercase" style={{ color: c.tagText }}>{feature.tag}</span>
                    </div>
                  </FadeIn>
                  <FadeIn delay={0.1}>
                    <h2 className={`grad-text grad-text-dark font-bold leading-tight mb-5 tracking-tight`}
                      style={{
                        fontSize: i < 2 ? 'clamp(36px, 4vw, 56px)' : 'clamp(30px, 3.5vw, 48px)',
                        whiteSpace: 'pre-line',
                      }}>
                      {feature.title}
                    </h2>
                  </FadeIn>
                  <FadeIn delay={0.2}>
                    <p className="text-base mb-8 leading-relaxed" style={{ color: c.textSecond }}>{feature.subtitle}</p>
                  </FadeIn>
                  <div className="space-y-4">
                    {feature.points.map((point, j) => (
                      <FadeIn key={j} delay={0.25 + j * 0.08}>
                        <div className="flex gap-3">
                          <div className="flex-shrink-0 mt-2 w-1 h-1 rounded-full" style={{ background: c.goldSolid, opacity: 0.6 }} />
                          <p className="text-sm leading-relaxed" style={{ color: c.textMuted }}>{point}</p>
                        </div>
                      </FadeIn>
                    ))}
                  </div>
                </div>
                {/* 视觉装饰区 */}
                <div className={i % 2 === 1 ? 'lg:col-start-1 lg:row-start-1' : ''}>
                  <FadeIn delay={0.15}>
                    <div className="relative rounded-2xl overflow-hidden p-8 md:p-12"
                      style={{
                        border: `1px solid ${c.featureBord}`,
                        background: c.featureBg,
                        minHeight: i <= 1 ? '540px' : i === 2 ? '460px' : '320px',
                        boxShadow: c.cardShadow,
                      }}>
                      <FeatureVisual index={i} colors={c} />
                    </div>
                  </FadeIn>
                </div>
              </div>
            </div>
          </div>
        ))}
      </section>

      {/* ══ 天·地·人 三分理论 ════════════════════════════ */}
      <section className="relative z-10 flex items-center px-6 md:px-10 lg:px-14 py-20"
        style={{ background: c.altSection, minHeight: '82svh' }}>
        <WeakBoundary line={c.navBorder} />
        <div className="mx-auto w-full" style={{ maxWidth: '1280px' }}>
          <FadeIn>
            <div className="text-center mb-10">
              <div className="flex items-center justify-center gap-3 mb-6">
                <div className="h-px w-12" style={{ background: `linear-gradient(to right, transparent, ${c.goldLine})` }} />
                <span className="text-[10px] tracking-[0.5em] uppercase" style={{ color: c.tagText }}>Ni Haixia · Philosophy</span>
                <div className="h-px w-12" style={{ background: `linear-gradient(to left, transparent, ${c.goldLine})` }} />
              </div>
              <h2 className={`grad-text grad-text-dark font-bold mb-5 tracking-tight`}
                style={{ fontSize: 'clamp(32px, 4vw, 48px)' }}>
                Thiên · Địa · Nhân
              </h2>
              <p className="max-w-2xl mx-auto text-sm leading-relaxed" style={{ color: c.textSecond }}>
                Quan điểm vận mệnh cốt lõi của thầy Ni Hải Hạ: Vận mệnh không bao giờ là toàn bộ cuộc đời.<br />
                Ông chia sức ảnh hưởng đến cuộc đời thành ba chiều quan trọng ngang nhau.
              </p>
            </div>
          </FadeIn>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
            {[
              { glyph: 'Thiên', label: 'Vận mệnh tiên thiên', pct: '⅓', color: c.goldSolid, borderColor: c.goldLine, desc: 'Tử Vi Đẩu Số tiết lộ là cục diện mệnh tiên thiên của một người — bố trí sao do thời gian sinh quyết định, số cục Ngũ Hành, chính tinh cung Mệnh. Đây chỉ là một phần ba vận mệnh, là nền tảng cuộc đời, không phải toàn bộ.', sub: 'Lá số · Sao · Ngũ Hành' },
              { glyph: 'Địa', label: 'Địa lý môi trường', pct: '⅓', color: 'rgba(96,165,250,0.9)', borderColor: 'rgba(96,165,250,0.3)', desc: 'Môi trường địa lý, thành phố, quốc gia, phong thủy, thậm chí bối cảnh gia đình và cấu trúc xã hội, cùng tạo nên chiều thứ hai của vận mệnh. Cùng một lá số, sinh ở nơi khác nhau, hoàn cảnh có thể khác biệt một trời một vực.', sub: 'Địa phương · Phong thủy · Môi trường' },
              { glyph: 'Nhân', label: 'Ý niệm con người', pct: '⅓', color: 'rgba(100,216,139,0.9)', borderColor: 'rgba(100,216,139,0.3)', desc: 'Ý chí, tâm thái, lựa chọn và hành động của bản thân mới là sức mạnh chủ động nhất thay đổi vận mệnh. Ni Sư nhấn mạnh: Hiểu lá số là để làm người tốt hơn, chứ không phải ngồi chờ vận mệnh sắp đặt. Tu luyện bản thân, là con đường phá cục mạnh nhất.', sub: 'Ý chí · Lựa chọn · Hành động' },
            ].map((item, i) => (
              <FadeIn key={item.glyph} delay={0.1 + i * 0.12}>
                <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.1 }}
                  className="rounded-2xl p-7 h-full flex flex-col"
                  style={{ background: c.cardBg, border: `1px solid ${item.borderColor}`, boxShadow: c.cardShadow }}>
                  <div className="flex items-start justify-between mb-5">
                    <div className="text-5xl font-bold leading-none" style={{ color: item.color }}>{item.glyph}</div>
                    <div className="text-right">
                      <div className="text-2xl font-bold" style={{ color: item.color }}>{item.pct}</div>
                      <div className="text-[9px] mt-0.5 tracking-widest" style={{ color: c.textMuted }}>of life</div>
                    </div>
                  </div>
                  <div className="mb-3">
                    <div className="text-sm font-medium mb-0.5" style={{ color: item.color }}>{item.label}</div>
                    <div className="text-[10px] tracking-wider" style={{ color: c.textMuted }}>{item.sub}</div>
                  </div>
                  <div className="h-px mb-4" style={{ background: item.borderColor }} />
                  <p className="text-xs leading-relaxed flex-1" style={{ color: c.textSecond }}>{item.desc}</p>
                </motion.div>
              </FadeIn>
            ))}
          </div>
          <FadeIn delay={0.3}>
            <div className="mt-10 text-center">
              <p className="text-sm leading-relaxed" style={{ color: c.textSecond }}>
                「Vận mệnh không phải là toàn bộ cuộc đời, cộng thêm địa lý và ý niệm của con người, mới là.」
              </p>
              <p className="mt-2 text-[10px] tracking-widest" style={{ color: c.tagText }}>— Ni Hải Hạ</p>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ══ 倪海夏介绍 ════════════════════════════════════ */}
      <section className="relative z-10 flex items-center px-6 md:px-10 lg:px-14 py-20" style={{ minHeight: '82svh' }}>
        <WeakBoundary line={c.navBorder} />
        <div className="mx-auto w-full" style={{ maxWidth: '1280px' }}>
          <FadeIn>
            <div className="text-center mb-10">
              <div className="flex items-center justify-center gap-3 mb-6">
                <div className="h-px w-12" style={{ background: `linear-gradient(to right, transparent, ${c.goldLine})` }} />
                <span className="text-[10px] tracking-[0.5em] uppercase" style={{ color: c.tagText }}>Master · 1953 – 2012</span>
                <div className="h-px w-12" style={{ background: `linear-gradient(to left, transparent, ${c.goldLine})` }} />
              </div>
              <h2 className={`grad-text grad-text-dark font-bold mb-6 tracking-tight`}
                style={{ fontSize: 'clamp(32px, 4vw, 48px)' }}>
                Thầy Ni Hải Hạ
              </h2>
              <p className="max-w-2xl mx-auto leading-relaxed text-sm" style={{ color: c.textSecond }}>
                Một trong những bậc thầy Y học cổ truyền và Thuật số có ảnh hưởng nhất trong cộng đồng Hoa kiều đương đại<br />
                Người sáng lập Học viện Hán Đường Y học cổ truyền Mỹ · Hai hệ thống giảng dạy「Nhân Kỷ」「Thiên Kỷ」truyền thừa
              </p>
            </div>
          </FadeIn>

          <FadeIn delay={0.1}>
            <div className="rounded-2xl p-8 md:p-10 mb-8"
              style={{ border: `1px solid ${c.niBorder}`, background: c.niBg, boxShadow: c.cardShadow }}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                {[
                { label: 'Sinh', value: 'Năm 1954', sub: 'Đài Loan' },
                { label: 'Mất', value: 'Năm 2012', sub: 'Ngày 31 tháng 1 · thọ 58 tuổi' },
                { label: 'Truyền thừa', value: 'Tử Vi Đẩu Số', sub: 'Y học cổ truyền · Kinh Dịch' },
                ].map(item => (
                  <div key={item.label} className="text-center rounded-xl px-4 py-3"
                    style={{ border: `1px solid ${c.niDivider}`, background: 'rgba(255,255,255,0.02)' }}>
                    <div className="text-[10px] tracking-[0.3em] mb-1" style={{ color: c.textFaint }}>{item.label}</div>
                    <div className="text-2xl font-semibold mb-0.5" style={{ color: c.goldSolid }}>{item.value}</div>
                    <div className="text-[11px]" style={{ color: c.textMuted }}>{item.sub}</div>
                  </div>
                ))}
              </div>
              <div className="h-px mb-8" style={{ background: c.niDivider }} />
              <div className="space-y-4 text-sm leading-relaxed max-w-3xl mx-auto" style={{ color: c.textSecond }}>
                <p>
                  <strong style={{ color: c.goldSolid }}>Lý lịch</strong>:
                  Thầy Ni Hải Hạ (1954-2012) sinh tại Đài Loan, từ nhỏ học nhiều vị thầy giỏi, chuyên nghiên cứu kinh phái (truyền thừa Thương Hàn Luận).
                  Trung niên sang Hoa Kỳ hành y, sáng lập<strong>Học viện Hán Đường Y học cổ truyền</strong>, hơn 20 năm hệ thống truyền thụ Y học cổ truyền và thuật số truyền thống.
                  Ngày 31 tháng 1 năm 2012 vì ung thư gan tại Đài Loan từ trần, thọ 58 tuổi.
                </p>
                <p>
                  <strong style={{ color: c.goldSolid }}>Hệ thống giảng dạy</strong>:
                  Thầy Ni tổng hợp những gì học được thành hai hệ thống giảng dạy công khai.
                  <strong>「Nhân Kỷ」</strong>gồm Châm Cứu Đại Thành, Thần Nông Bản Thảo Kinh, Hoàng Đế Nội Kinh, Thương Hàn Luận, Kim Quy Yếu Lược
                  - đây là「Nhân chi kỷ」, đặt nền tảng con đường học Y học cổ truyền hoàn chỉnh;
                  <strong>「Thiên Kỷ」</strong>gồm Tử Vi Đẩu Số và Kinh Dịch - đây là「Thiên chi kỷ」, là thành quả hệ thống hóa nghiên cứu thuật số.
                  Hai hệ thống kết hợp, là di sản hoàn chỉnh nhất mà thầy Ni để lại cho hậu thế.
                </p>
                <p>
                  <strong style={{ color: c.goldSolid }}>Lập trường Tử Vi</strong>:
                  Thầy Ni trong Tử Vi Đẩu Số thuộc<strong>phái Tam hợp Nam phái</strong>, chủ trương「lấy Mệnh cung làm gốc, lấy Tam phương Tứ chính làm dụng, lấy Tứ hóa làm cương」.
                  Trong khóa học「Thiên Kỷ」thầy nói rõ:「<em>Phi tinh (Tứ hóa) bay tới bay lui quá phức tạp, không làm cái này, rốt cuộc đại đạo chí giản</em>」
                  - lập trường này phân biệt rõ ràng với phái Phi tinh phức tạp.
                </p>
                <p>
                  <strong style={{ color: c.goldSolid }}>Thái độ học thuật</strong>:
                  Thầy Ni phản đối cách học vẹt khẩu quyết, nhấn mạnh「hiểu nguyên lý hơn là thuộc lòng」「logic có thể kiểm chứng hơn là huyền bí」.
                  Thái độ này khiến Tử Vi Đẩu Số từ hệ thống kín truyền bế mật đồ đệ, trở nên hệ thống hóa, có thể kiểm chứng, có thể học được kiến thức hiện đại.
                </p>
                <p>
                  <strong style={{ color: c.goldSolid }}>Ảnh hưởng đương đại</strong>:
                  Video giảng dạy của thầy Ni được lan truyền rộng rãi trên Bilibili, YouTube và các nền tảng lớn, được công nhận là bài học bắt buộc của thế hệ mới yêu thích mệnh lý và Y học cổ truyền.
                  Thầy không chỉ là người truyền thừa Tử Vi Đẩu Số, mà còn là một trong những nhân vật quan trọng nhất đưa mệnh lý truyền thống và Y học cổ truyền vào hệ thống kiến thức hiện đại.
                </p>
                <p style={{ fontSize: '11px', color: c.textMuted, fontStyle: 'italic', marginTop: '12px' }}>
                  Tất cả các giải đọc trên nền tảng này dựa trên giáo trình giảng dạy công khai「Thiên Kỷ」của thầy Ni, bản minh 「Tử Vi Đẩu Số Toàn Thư」, và các sách cổ phái Tam hợp truyền thống được biên soạn lại,
                  chỉ mang tính tham khảo văn hóa và phát triển bản thân. Thầy Ni và nền tảng này không có bất kỳ liên kết thương mại nào.
                </p>
              </div>
            </div>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {NI_TEACHINGS.map((teaching, i) => (
              <FadeIn key={i} delay={0.1 + i * 0.08}>
                <motion.div whileHover={{ y: -3 }} transition={{ duration: 0.1 }}
                  className="rounded-xl p-6 h-full"
                  style={{ border: `1px solid ${c.niCardBord}`, background: c.niCardBg, boxShadow: c.niCardShadow }}>
                  <div className="flex items-start gap-3 mb-3">
                    <div className="flex-shrink-0 w-5 h-5 rounded-full border flex items-center justify-center mt-0.5"
                      style={{ borderColor: c.goldLine }}>
                      <span className="text-[9px]" style={{ color: c.goldSolid }}>{i + 1}</span>
                    </div>
                    <h3 className="text-sm font-medium leading-relaxed" style={{ color: c.goldSolid }}>{teaching.title}</h3>
                  </div>
                  <p className="text-xs leading-relaxed pl-8" style={{ color: c.textSecond }}>{teaching.body}</p>
                </motion.div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ══ 合盘入口 ══════════════════════════════════════ */}
      <section className="relative z-10 px-6 md:px-10 lg:px-14 py-20">
        <div className="mx-auto" style={{ maxWidth: '1280px' }}>
          <div className="rounded-2xl p-10 md:p-14 text-center"
            style={{
              background: 'rgba(6, 4, 10, 0.98)',
              border: `1px solid ${c.cardBorder}`,
              boxShadow: c.cardShadow,
            }}>
            <FadeIn>
              <div className="flex items-center justify-center gap-3 mb-6">
                <div className="h-px w-8" style={{ background: c.goldLine }} />
                <span className="text-[10px] tracking-[0.5em] uppercase" style={{ color: c.tagText }}>Compatibility · Analysis</span>
                <div className="h-px w-8" style={{ background: c.goldLine }} />
              </div>
              <h2 className={`grad-text grad-text-dark font-bold mb-4 tracking-tight`}
                style={{ fontSize: 'clamp(26px, 3.5vw, 40px)' }}>
                Tử Vi hợp bàn
              </h2>
              <p className="text-sm leading-relaxed mb-8 max-w-lg mx-auto" style={{ color: c.textSecond }}>
                Nhập thông tin sinh của hai người, AI dựa trên hệ thống Ni Hải Hạ phân tích cung Phu Thê tương tham, tương hợp Mệnh cung và tương tác Tam phương Tứ chính,<br className="hidden md:block" />
                đưa ra mức độ tương hợp tình cảm, khả năng hợp tác kinh doanh và gợi ý quan hệ tốt nhất.
              </p>
              <div className="flex justify-center gap-3 flex-wrap mb-6">
                {['Phân tích tương hợp tình cảm', 'Đánh giá hợp tác kinh doanh', 'Giải đọc duyên phận cha mẹ', 'Đánh giá tương hợp trước hôn nhân'].map(item => (
                  <span key={item} style={{
                    fontSize: '12px', padding: '5px 14px', borderRadius: '20px',
                    background: 'rgba(200,148,42,0.06)',
                    border: `1px solid ${c.goldLine}`,
                    color: c.goldSolid,
                  }}>
                    {item}
                  </span>
                ))}
              </div>
              <motion.button
                whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                onClick={() => router.push('/heming')}
                className="px-10 py-3 font-medium text-sm tracking-widest rounded-full"
                style={{
                  background: 'rgba(200,148,42,0.08)',
                  border: `1px solid ${c.goldLine}`,
                  color: c.goldSolid,
                  cursor: 'pointer',
                }}>
                Bắt đầu phân tích hợp bàn
              </motion.button>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ══ 最终 CTA ══════════════════════════════════════ */}
      <section className="relative z-10 py-40 px-6 text-center" style={{ background: c.altSection }}>
        <FadeIn>
          <p className="text-[10px] tracking-[0.6em] uppercase mb-6" style={{ color: c.tagText }}>Bắt đầu hành trình lá số của bạn</p>
          <h2 className={`grad-text grad-text-dark font-bold mb-8 tracking-tight leading-tight`}
            style={{ fontSize: 'clamp(32px, 5vw, 60px)' }}>
            Lá số Tử Vi của bạn<br />đang chờ bạn giải đọc
          </h2>
          <p className="text-sm mb-10 max-w-md mx-auto leading-relaxed" style={{ color: c.textSecond }}>
            Nhập ngày giờ sinh, trong vài giây tạo lá số riêng của bạn<br />
            Sau đó AI theo hệ thống Ni Hải Hạ giải đọc sâu cho bạn
          </p>
          <motion.button
            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            onClick={() => router.push('/chart')}
            className="px-14 py-4 font-semibold text-base tracking-widest rounded-full"
            style={{ background: c.ctaBg, color: c.ctaText }}>
            Tạo lá số miễn phí
          </motion.button>
          <div className="mt-4 flex flex-wrap gap-3 justify-center">
            <motion.a
              href="/knowledge"
              whileHover={{ scale: 1.02 }}
              className="text-xs tracking-[0.2em] inline-flex items-center gap-2 px-4 py-2 rounded-full"
              style={{
                color: c.goldSolid,
                border: `1px solid ${c.goldLine}`,
                background: 'transparent',
                textDecoration: 'none',
              }}>
              ✦ Cơ sở tri thức Tử Vi Đẩu Số →
            </motion.a>
            <motion.a
              href="/library"
              whileHover={{ scale: 1.02 }}
              className="text-xs tracking-[0.2em] inline-flex items-center gap-2 px-4 py-2 rounded-full"
              style={{
                color: c.goldSolid,
                border: `1px solid ${c.goldLine}`,
                background: 'transparent',
                textDecoration: 'none',
              }}>
              📜 Kho tàng cổ điển →
            </motion.a>
          </div>
        </FadeIn>
      </section>

      {/* Footer */}
      <footer className="relative z-10 py-10 px-6"
        style={{ borderTop: `1px solid ${c.niCardBord}` }}>

        {/* 4 板块导航占位（已上线 + 即将开放）*/}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="text-[9px] tracking-[0.3em] text-center mb-4 uppercase"
            style={{ color: c.textMuted, opacity: 0.6 }}>
            Phương pháp luận của Ni Sư · Hệ thống học thuật
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            {SECTIONS.map(s => {
              const ready = s.status === 'ready';
              return (
                <a
                  key={s.key}
                  href={ready ? '/chart' : undefined}
                  onClick={ready ? undefined : (e) => e.preventDefault()}
                  className="rounded-lg px-3 py-3 text-center transition-all"
                  style={{
                    background: ready ? c.starBg : 'transparent',
                    border: `1px ${ready ? 'solid' : 'dashed'} ${ready ? c.goldLine : c.navBorder}`,
                    cursor: ready ? 'pointer' : 'not-allowed',
                    opacity: ready ? 1 : 0.5,
                    textDecoration: 'none',
                  }}
                >
                  <div className="text-base font-semibold mb-0.5 tracking-[0.1em]"
                    style={{ color: ready ? c.goldSolid : c.textMuted }}>
                    {s.name}
                  </div>
                  <div className="text-[9px] tracking-wider"
                    style={{ color: ready ? '#10b981' : c.textMuted }}>
                    {ready ? '✓ Đã mở' : `${s.when} mở`}
                  </div>
                </a>
              );
            })}
          </div>
        </div>

        <div className="text-center">
          <p className="text-[10px] tracking-wider mb-3" style={{ color: c.footerText }}>
            Lá Số Tử Vi · Dựa trên hệ thống chính thống Ni Hải Hạ · Chỉ mang tính tham khảo, vận mệnh nằm trong tay bạn
          </p>
          <p className="text-[10px] tracking-wider mb-3 max-w-2xl mx-auto leading-relaxed"
            style={{ color: c.footerText, opacity: 0.85 }}>
            Nền tảng dựa trên nghiên cứu văn hóa truyền thống Trung Hoa, chỉ cung cấp tài liệu tham khảo học tập.<br className="sm:hidden" />
            Không cấu thành bất kỳ lời khuyên y tế, đầu tư, pháp lý hay quyết định quan trọng nào.
          </p>
          <p className="text-[10px] tracking-wider" style={{ color: c.footerText }}>
              <a href="/terms" style={{ color: c.footerText, textDecoration: 'underline' }}>Điều khoản dịch vụ</a>
              {' · '}
              <a href="/privacy" style={{ color: c.footerText, textDecoration: 'underline' }}>Chính sách bảo mật</a>
          </p>
        </div>
      </footer>
    </div>
  );
}
