'use client';
import { motion, AnimatePresence } from 'framer-motion';
import type { Star } from '@/lib/ziwei/types';
import { STAR_DESCRIPTIONS, STAR_NAME_VI, PALACE_NAME_VI } from '@/lib/ziwei/constants';

interface StarDetailPanelProps {
  star: Star | null;
  palaceName?: string;
  onClose: () => void;
}

// 倪海夏体系各星详细解读（参考顾祥弘《飞星紫微斗数全书》及南北山人《紫微斗数全书》）
const STAR_DETAIL: Record<string, {
  niHaixia: string;
  classical: string;
  bestPalace: string;
  worstPalace: string;
  career: string;
  relationship: string;
  wealth: string;
  health: string;
}> = {
  '紫微': {
    niHaixia: 'Thầy Ni nhận định Tử Vi là sao Hoàng Đế — người có sao này tọa Mệnh mang khí độc lập, thích ở một mình, không muốn bị quản thúc. Tử Vi cần có Tả Phụ Hữu Bật giáp mới phát huy được đế vương khí, bằng không chỉ là minh chủ cô đơn, giàu mà chẳng quý. Tử Vi tọa Thìn Tuất là đẹp nhất, kết hợp Thiên Phủ thành song tinh cách, tài quan song mỹ. Tử Vi sợ nhất Hỏa Tinh, Linh Tinh, Kình Dương, Đà La đồng cung — thêm sát thì cô quý, có quyền mà thiếu tài.',
    classical: 'Cổ quyết: «Tử Vi Đế Tọa lâm Mệnh chủ tôn quý, thống lĩnh quần tinh, tọa Mệnh chủ uy quyền hiển đạt.» Nam Bắc Sơn Nhân chú: «Tử Vi thủ Mệnh tại Thìn, tài quan song mỹ, ra làm tướng vào làm tướng quốc, vị chí tam công; Tử cung an Mệnh thì phú quý không bền.»',
    bestPalace: 'Mệnh (Thìn·Tuất), Quan Lộc',
    worstPalace: 'Tật Ách, Phu Thê',
    career: 'Chính giới, quản lý cấp cao, tự khởi nghiệp — thiên phú lãnh đạo, phù hợp vị trí một mình một cõi',
    relationship: 'Tình cảm thụ động, tự trọng cao, cần đối phương chủ động, có xu hướng cô đơn — kết hôn muộn thì cát',
    wealth: 'Tài vận ổn định, giữ thành hơn tiến công — tại Thìn Tuất tài quan song mỹ, phù hợp đầu tư tích lũy',
    health: 'Hành Thổ — chú ý tỳ vị, tiêu hóa. Tránh quá sức, nên giữ nếp sinh hoạt đều đặn',
  },
  '天机': {
    niHaixia: 'Thầy Ni nói Thiên Cơ là sao tham mưu — ngôi sao thông minh nhất, nhưng thông minh lộ ra ngoài thì tự hại. Thiên Cơ Hóa Kỵ là rắc rối nhất, tượng trưng khôn lanh mà lại bị cái khôn hại thân. Thiên Cơ hành Mộc, biến đổi linh hoạt; tọa Mệnh thì tư duy nhạy bén nhưng thường đa mưu thiếu quyết, cần rời quê hương đi xa mới phát triển — ứng biến linh hoạt là đặc tính lớn nhất.',
    classical: 'Cổ quyết: «Người sinh ra lanh lợi, tự thích kinh doanh, Thiên Cơ hành Mộc, buôn bán thấy nhiều cơ hội, ly tổ tất xa thân.» Nam Bắc Sơn Nhân chú: «Thiên Cơ cư miếu vượng thì người tinh anh, giỏi hoạch định; cư hãm thì tối tăm, ai cũng đi buôn.»',
    bestPalace: 'Mệnh (Mão), Quan Lộc',
    worstPalace: 'Phu Thê',
    career: 'Chuyên gia kỹ thuật, mưu sĩ, nghiên cứu viên, IT, hoạch định — dùng đầu óc hơn chân tay, phù hợp rời quê phát triển',
    relationship: 'Tình cảm đa biến, ý tưởng nhiều, khó chuyên nhất — nên kết hôn muộn, sau hôn nhân cần học buông bỏ suy nghĩ',
    wealth: 'Kiếm tiền bằng trí tuệ và kỹ năng, không giỏi giữ của — hành nghề kỹ thuật chuyên môn thì tài vận ổn định',
    health: 'Hành Mộc — chú ý gan mật, thần kinh. Lo nghĩ nhiều dễ mất ngủ, nên luyện tập tĩnh tâm thiền định',
  },
  '太阳': {
    niHaixia: 'Thầy Ni cho rằng Thái Dương là sao trượng phu chính khí, tại Mão–Ngọ là vào miếu, quang minh chính đại; sau Ngọ dần lạc hãm. Người Thái Dương tọa Mệnh hào phóng, hay giữ diện, nam mệnh thì tốt, nữ mệnh thì quá mạnh mẽ. Thái Dương tượng trưng cha và bậc trưởng, tọa Mệnh thì người hướng ngoại, thích được mọi người nhìn thấy — thích hợp công chức hoặc đời sống công chuyên. Lạc hãm thì trước chăm sau lười, cô quả vất vả.',
    classical: 'Cổ quyết: «Thái Dương cư Ngọ vi vào miếu, quang huy đại phóng, chủ quý hiển, nam mệnh tốt nhất; lạc hãm thì cô quả vất vả, trước chăm sau lười.» Nam Bắc Sơn Nhân chú: «Thái Dương tại Ngọ cung thủ Mệnh, tài quan song mỹ, ra tướng vào tướng; Ất năm sinh người gặp hung cũng đại lợi.»',
    bestPalace: 'Mệnh (Mão–Ngọ), Quan Lộc',
    worstPalace: 'Phu Thê (nữ mệnh), Tật Ách',
    career: 'Công chức, chính giới, quản lý, quan hệ công chuyên, giáo dục, truyền thông — thích hiện diện, phù hợp sự nghiệp công chúng',
    relationship: 'Nam mệnh duyên tốt nhưng đa tình, nữ mệnh quá mạnh mẽ — hôn nhân cần mài mò, nên chọn đối phương dung cảm nhẹ nhàng',
    wealth: 'Tài vận do cố gắng mà có, hào phóng khó tích lũy — vào miếu thì tài vượng, lạc hãm thì thăng trầm',
    health: 'Hành Hỏa — chú ý tim, mắt. Lạc hãm dễ quá sức, cần nghỉ ngơi đầy đủ',
  },
  '武曲': {
    niHaixia: 'Thầy Ni xem Vũ Khúc là sao tài bạch chính tinh, cương cường bất khuất, nhưng sợ nhất cô khắc. Người Vũ Khúc tọa Mệnh ý chí kiên cường, giỏi tài chính lý tài, nhưng trong tình cảm quá thẳng thắn dễ làm đau người. Vũ Khúc Hóa Kỵ phải cẩn thận tai nạn, cầu máu. Vũ Khúc tại Thìn Tuất Sửu Mùi được vượng địa, kết hợp Thất Sát thành Tướng Tài Cách — là cách cục tài phú rất tốt.',
    classical: 'Cổ quyết: «Vũ Khúc hành Kim, tính cương mạnh, một đời nhiều hình khắc; thủ Mệnh tại vượng địa, ra tướng vào tướng.» Nam Bắc Sơn Nhân chú: «Vũ Khúc thủ Mệnh, tam phương tứ chính đều cát, tài quan song mỹ; gặp Thất Sát đồng cung thành Tướng Tài Cách, chủ đại phú.»',
    bestPalace: 'Mệnh (Thìn·Tuất·Sửu·Mùi), Tài Bạch, Quan Lộc',
    worstPalace: 'Phu Thê',
    career: 'Tài chính, quân cảnh, kế toán, kỹ thuật, kỹ sư — sức thực hiện mạnh, phù hợp lĩnh vực đòi hỏi bản lĩnh và quyết đoán',
    relationship: 'Tình cảm thẳng thắn, thiếu tình tứ — cần đối phương nhẹ nhàng bù trừ, tránh cô khắc tình duyên',
    wealth: 'Sao tài bạch, tài vận cực mạnh, khả năng lý tài xuất sắc — tại Thìn Tuất tài quan song mỹ',
    health: 'Hành Kim — chú ý phổi, hô hấp, răng. Hóa Kỵ phải phòng tai nạn, cầu máu',
  },
  '天同': {
    niHaixia: 'Thầy Ni nói Thiên Đồng là sao Phúc — sao lười nhất. Thiên Đồng tọa Mệnh thích hưởng thụ, không thích cạnh tranh, phù hợp công việc ổn định. Thiên Đồng kết hợp Thiên Lương là đẹp nhất — vừa hưởng phúc vừa có bảo đảm. Thiên Đồng Hóa Lộc là Hóa Lộc đẹp nhất, cả đời ăn mặc đầy đủ, vui vẻ thảnh thơi. Thiên Đồng sợ lạc hãm, lạc hãm thì phúc giảm.',
    classical: 'Cổ quyết: «Thiên Đồng là sao phúc đức, tọa Mệnh thì hưởng phúc có thừa, một đời tiêu dao tự tại, không vất vả lao khổ.» Nam Bắc Sơn Nhân chú: «Thiên Đồng thủ Mệnh, tam phương không sát, một đời vui vẻ, cơm đủ áo ấm; thêm cát tinh thì phú quý song toàn.»',
    bestPalace: 'Mệnh, Phúc Đức',
    worstPalace: 'Quan Lộc',
    career: 'Dịch vụ, giải trí, ẩm thực, văn nghệ — môi trường nhẹ nhàng vui vẻ là thích hợp nhất, tránh cạnh tranh cao áp',
    relationship: 'Tình cảm nhẹ nhàng, không chủ động, dễ thụ động chấp nhận — hôn nhân khá ổn định, tính cách thân thiện dễ gần',
    wealth: 'Tài vận không nổi bật, nhờ lương ổn định, không đầu cơ, ăn mặc đầy đủ nhưng khó giàu lớn',
    health: 'Hành Thủy — chú ý thận, bàng quang. Thể chất yếu hơn, nên vận động vừa phải, giữ tinh thần nhẹ nhàng',
  },
  '廉贞': {
    niHaixia: 'Thầy Ni cho rằng Liêm Trinh là đào hoa thứ — tài hoa xuất chúng nhưng tình cảm phức tạp. Liêm Trinh Hóa Kỵ cực kỳ hung, tượng trưng quan sự, tù ngục, tai nạn. Liêm Trinh kết hợp Thiên Tướng đồng cung thì hóa hung thành cát, thành cách hành chính ấn thụ. Liêm Trinh ngũ hành Hỏa, tính cách cương liệt, một đời nhiều thăng trầm — tài nghệ xuất chúng, giữ vững chính đạo thì có thể thành đại khí.',
    classical: 'Cổ quyết: «Liêm Trinh là đào hoa thứ, tài hoa xuất chúng, tình duyên nhiều sóng gió; Liêm Tướng đồng cung, hóa hung thành cát, thành hành chính ấn thụ cách, có thể nắm quyền binh.» Nam Bắc Sơn Nhân chú: «Liêm Trinh thủ Mệnh, gặp cát tinh thì tài hoa xuất chúng, Hóa Kỵ thì quan sự cầu mình, phải cẩn thận.»',
    bestPalace: 'Quan Lộc (kết hợp Thiên Tướng), Mệnh (khi Hóa Lộc)',
    worstPalace: 'Mệnh (khi Hóa Kỵ), Phu Thê',
    career: 'Nghệ thuật, giải trí, luật pháp, công chức (kết hợp Thiên Tướng) — tài nghệ xuất chúng, giữ vắng nghề mới bền vững',
    relationship: 'Đào hoa nhiều, tình cảm phức tạp, dễ gặp rắc rối tình ái — nên kết hôn muộn, chọn người điềm đạm ổn trọng',
    wealth: 'Tài vận thăng trầm, nhờ tài nghệ kiếm tiền — Hóa Kỵ phải phòng tranh chấp tài chính và rủi ro pháp lý',
    health: 'Hành Hỏa — chú ý tim, máu, gan. Hóa Kỵ phòng tai nạn và phẫu thuật, lưu ý cầu máu',
  },
  '天府': {
    niHaixia: 'Thầy Ni nói Thiên Phủ là sao tài khố — sao giữ thành, không chủ động phát tài nhưng có thể giữ được tài sản. Người Thiên Phủ tọa Mệnh bình ổn bảo thủ, nữ mệnh tốt nhất, có thể vượng chồng hưng gia. Thiên Phủ ưa Tử Vi đồng cung hoặc đối chiếu, thành song tinh cách, tài quan song mỹ. Thiên Phủ sợ Không Kiếp giáp — gặp Không Kiếp thì tài khố cạn đáy, giữ không được của.',
    classical: 'Cổ quyết: «Thiên Phủ là sao tài khố, thủ Mệnh thì bình ổn bảo thủ, chủ tích tài vượng gia; nữ mệnh gặp chi, có thể vượng chồng ích con, gia đạo hưng thịnh.» Nam Bắc Sơn Nhân chú: «Thiên Phủ thủ Mệnh, tam phương cát tụ, tài quan song mỹ, phú quý an khang; gặp Không Kiếp thì tài khố phá lậu, khó tích tài.»',
    bestPalace: 'Mệnh, Tài Bạch, Điền Trạch',
    worstPalace: 'Di Chuyển',
    career: 'Hành chính quản lý, tài vụ, bảo hiểm, bất động sản — cầu ổn không mạo hiểm, phù hợp nghề nghiệp giữ thành',
    relationship: 'Tình cảm ổn định, gia đình trước, là người bạn đời tốt — trọng an toàn gia đình và đảm bảo kinh tế',
    wealth: 'Tài vận cực tốt, giữ tài giỏi — phù hợp đầu tư tích lũy và bất động sản',
    health: 'Hành Thổ — chú ý tỳ vị, tiêu hóa. Thể chất vững, nên giữ ăn uống và sinh hoạt đều đặn',
  },
  '太阴': {
    niHaixia: 'Thầy Ni nhận định Thái Âm là sao tài tinh, lợi nữ mệnh, cũng là sao đại diện mẹ và vợ trong nam mệnh. Thái Âm vào miếu thì tài vận cực tốt, lạc hãm thì tài vận bị cản trở. Thái Âm Hóa Kỵ cần chú ý vấn đề của thân nhân nữ. Thái Âm tại Hợi Tý vào miếu, hào quang toàn chiếu, đại diện thanh tú tao nhã, tình cảm phong phú, coi trọng thế giới nội tâm và đời sống tinh thần.',
    classical: 'Cổ quyết: «Thái Âm là tài tinh, lợi nữ mệnh; Hợi Tý vào miếu, hào quang toàn chiếu, tài vận cực vượng; Ngọ vị lạc hãm, ưu sầu đa tình, tài vận bình đạm.» Nam Bắc Sơn Nhân chú: «Thái Âm thủ Mệnh, vào miếu thì tài phú hậu hĩnh, nữ mệnh đặc biệt tốt; lạc hãm thì cần cố gắng mới có thể giàu có, tình cảm tế nhị.»',
    bestPalace: 'Mệnh (Hợi·Tý), Tài Bạch',
    worstPalace: 'Mệnh (Ngọ vị lạc hãm)',
    career: 'Tài vụ, tài chính, bất động sản, nghệ thuật, giáo dục — tế nhị kiên nhẫn, phù hợp nghề cần thẩm mỹ và nhu cảm',
    relationship: 'Tình cảm nhu mỹ tế nhị, coi trọng cảm nhận nội tâm — cần mối quan hệ ổn định có cảm giác an toàn',
    wealth: 'Vào miếu tài vận cực vượng, lạc hãm thì cần cố gắng; lý tài cẩn thận, giỏi tích lũy, không thích mạo hiểm',
    health: 'Hành Thủy — chú ý thận, tử cung (nữ mệnh). Cảm xúc thay đổi ảnh hưởng sức khỏe, nên giữ tâm trạng vui vẻ',
  },
  '贪狼': {
    niHaixia: 'Thầy Ni nói Tham Lang là sao đa tài nhất, đào hoa nặng nhất. Tham Lang Hóa Lộc vào Mệnh thì sức hút bốn phương, ai gặp cũng thích. Tham Lang là sao phát muộn — trung niên sau mới thực sự phát đạt. Tham Lang tại Dần Thân vào miếu tốt nhất, đào hoa vượng, tài nghệ siêu quần; Hóa Lộc thì tài vận đại phát, nhưng gặp Không Kiếp thì một đời nhiều sóng gió, khó tụ tài.',
    classical: 'Cổ quyết: «Tham Lang phát phúc hanh thông, đa tài đa nghệ, đào hoa nặng nhất; nhưng khó qua ba mươi tuổi, phát muộn là nhiều.» Nam Bắc Sơn Nhân chú: «Tham Lang thủ Mệnh, gặp cát thì phúc lộc đa thọ; nhưng về sau khó kết thúc tốt, nên tu thân dưỡng đức mới được thiện chung.»',
    bestPalace: 'Mệnh (Hóa Lộc), Phúc Đức, Di Chuyển',
    worstPalace: 'Tật Ách',
    career: 'Nghệ thuật, giải trí, quan hệ công chúng, kinh doanh, phong thủy ngũ thuật — nhờ nhân mạch và tài nghệ, đa tài đa nghệ',
    relationship: 'Đào hoa cực vượng, tình cảm đa dạng, nên kết hôn muộn — sau hôn nhân cần kiềm chế đào hoa mới có thể đầu bạc răng long',
    wealth: 'Nhờ nhân mạch và tài nghệ kiếm tiền, tài vận trung niên mới ổn — Hóa Lộc thì tài nguyên rộng rãi, sớm nên giữ thành',
    health: 'Hành Mộc (có Thủy) — chú ý gan, thận. Đào hoa quá vượng dễ hao tổn tinh lực, nên tiết chế điều dưỡng',
  },
  '巨门': {
    niHaixia: 'Thầy Ni nhận định Cự Môn là sao khẩu thiệt thị phi, nhưng Hóa Lộc Hóa Quyền thì chuyển cát, thành cách nhờ khẩu tài kiếm tiền. Cự Môn tọa Mệnh đa nghi, thiện biện, phù hợp luật sư, giáo viên, bán hàng. Cự Môn kỵ nhất Hóa Kỵ — chủ khẩu thiệt thị phi không dứt, thậm chí gây ra tố tụng. Cự Môn tại Tý Ngọ vị khá tốt, khẩu tài tốt, chủ nhờ ngôn ngữ lập thân.',
    classical: 'Cổ quyết: «Cự Môn là ám diệu, chủ khẩu thiệt thị phi; Hóa Lộc Quyền thì chuyển thành nhờ khẩu tài mưu sinh, chủ phú quý.» Nam Bắc Sơn Nhân chú: «Cự Môn thủ Mệnh, gặp Hóa Lộc Quyền, dùng khẩu thiệt làm nghề thì đại cát; Hóa Kỵ thì khẩu thiệt liên lụy, quan sự cầu thân, cần cẩn thận lời nói.»',
    bestPalace: 'Quan Lộc (Hóa Lộc·Quyền), Mệnh (Tý·Ngọ)',
    worstPalace: 'Phu Thê, Tật Ách (Hóa Kỵ)',
    career: 'Luật sư, giáo viên, nhân viên kinh doanh, dẫn chương trình, chuyên gia đàm phán — khẩu tài là cốt lõi cạnh tranh',
    relationship: 'Đa nghi đa lự, dễ suy nghĩ quá nhiều — giao tiếp là chìa khóa hôn nhân, cần chọn bạn đời có kiên nhẫn',
    wealth: 'Nhờ khẩu tài và kỹ năng chuyên môn kiếm tiền, Hóa Lộc tài vận tốt hơn — Hóa Kỵ phòng tranh chấp tài chính',
    health: 'Hành Thủy — chú ý thận, tai, khoang miệng. Đa tư đa lự dễ thương thân, nên học cách thư giãn giảm áp',
  },
  '天相': {
    niHaixia: 'Thầy Ni nói Thiên Tướng là sao ấn thụ, phụ trách hành chính thứ vụ. Người Thiên Tướng tọa Mệnh đúng khuôn phép, phù hợp công chức hành chính. Thiên Tướng cần có sao mạnh phối hợp mới phát huy, đơn độc tọa Mệnh thì khá bình đạm. Thiên Tướng ưa Liêm Trinh cùng hành, thành Liêm Tướng cách, có thể chủ hành chính đại quyền; sợ nhất Phá Quân đồng cung, thành hình kỵ giáp ấn cách, chủ hung hiểm.',
    classical: 'Cổ quyết: «Thiên Tướng là sao ấn thụ, chủ hành chính thứ vụ; Liêm Tướng đồng cung, hóa hung thành cát, chưởng hành chính đại quyền.» Nam Bắc Sơn Nhân chú: «Thiên Tướng thủ Mệnh, đúng khuôn phép, phù hợp công chức; có Liêm Trinh phối hợp, có thể thành quốc gia đống lương; Phá Quân đồng thủ thì hình khắc khó tránh.»',
    bestPalace: 'Quan Lộc, Mệnh (phối Liêm Trinh)',
    worstPalace: 'Tài Bạch, Mệnh (phối Phá Quân → hình kỵ giáp ấn)',
    career: 'Công chức, hành chính quản lý, thư ký, trợ lý — giỏi vai trò hỗ trợ phụ tá, cần sao mạnh dẫn đường',
    relationship: 'Tình cảm ổn định, trung hậu thật thà, là người bạn đời tốt — nhưng cần đối phương chủ đạo hướng đi',
    wealth: 'Tài vận bình ổn, nhờ lương tích lũy, không thích mạo hiểm đầu tư — giữ thành lý tài là tốt nhất',
    health: 'Hành Thủy — chú ý thận, hệ bạch huyết. Thể chất trung bình, nên giữ thói quen sinh hoạt đều đặn',
  },
  '天梁': {
    niHaixia: 'Thầy Ni nhận định Thiên Lương là sao âm hộ, có thể bảo hộ người khác, cũng tượng trưng y dược tôn giáo. Người Thiên Lương tọa Mệnh có duyên bậc trưởng, thời trẻ nhiều gian nan, tuổi già hưởng phúc. Thiên Lương sợ nhất Hóa Kỵ, đại diện bậc trưởng hoặc sức khỏe có vấn đề. Thiên Lương cùng Thái Dương đồng cung là đẹp nhất — nhật nguyệt đồng minh, quý nhân che chắn, một đời có quý nhân phù trợ, cuối cùng bình an.',
    classical: 'Cổ quyết: «Thiên Lương là sao âm hộ, chủ che chở bảo hộ; tọa Mệnh có duyên bậc trưởng, thời trẻ chịu rèn luyện, tuổi già hưởng thanh phúc.» Nam Bắc Sơn Nhân chú: «Thiên Lương thủ Mệnh, cần gặp cát tinh mới phát đạt; gặp Thái Dương đồng cung, nhật nguyệt đồng minh, chủ quý hiển, một đời nhiều quý nhân phù trợ.»',
    bestPalace: 'Mệnh, Phụ Mẫu, Phúc Đức',
    worstPalace: 'Mệnh (khi Hóa Kỵ), Tài Bạch',
    career: 'Y tế, tôn giáo, luật pháp, công tác xã hội, từ thiện — thích giúp đỡ người, có tâm che chở quần chúng',
    relationship: 'Tình cảm thường chênh lệch tuổi tác, hoặc duyên đến muộn — cần kiên nhẫn chờ đợi mới có duyên lành',
    wealth: 'Tài vận nhờ quý nhân phù trợ, thời trẻ tài vận kém, tuổi già mới ổn định — nên giữ thành không nên xung',
    health: 'Hành Thổ — chú ý tỳ vị, xương cốt. Cần coi trọng bảo dưỡng sức khỏe tuổi già, nên dự phòng sớm',
  },
  '七杀': {
    niHaixia: 'Thầy Ni nói Thất Sát là sao tướng quân, quả quyết xung lực mạnh, nhưng có tính cô khắc. Thất Sát tọa Mệnh phải có phụ tinh hóa giải tính cô, bằng không lục thân duyên mỏng. Thất Sát cùng Vũ Khúc là Tướng Tài Cách, cực tốt. Thất Sát sợ nhất trúc la tam hạn (Dương Đà Hỏa Linh chiếu đủ), chủ đại hung, phải phòng tai nạn. Thất Sát Hóa Lộc thì phản cát, có thể thành đại tướng chi tài.',
    classical: 'Cổ quyết: «Thất Sát là sao tướng quân, quả quyết xung lực mạnh; thủ Mệnh tính cô khắc nặng, lục thân duyên mỏng.» Nam Bắc Sơn Nhân chú: «Thất Sát thủ Mệnh, tam hợp cát tụ thì đại quý; gặp trúc la tam hạn (Dương Đà Hỏa Linh), chủ đại hung, phòng tai nạn bất ngờ, phòng hình khắc.»',
    bestPalace: 'Mệnh (có phụ tinh), Quan Lộc',
    worstPalace: 'Phu Thê, Phụ Mẫu',
    career: 'Quân cảnh, khởi nghiệp, giao dịch tài chính, độc đương một mình — cần quyết đoán nhanh và bản lĩnh',
    relationship: 'Tình cảm cô khắc, khó tìm bạn đời phù hợp — cần người có thể bao dung tính cách mạnh mẽ, nên kết hôn muộn',
    wealth: 'Tài vận thay đổi lớn, có cơ hội đại phú, cũng có đại khởi đại lạc; Vũ Khúc đồng cung thành Tướng Tài Cách đại quý',
    health: 'Hành Kim — chú ý phổi, ruột già. Tính tình nóng vội dễ thương thân, nên học kiềm chế cảm xúc và tu thân',
  },
  '破军': {
    niHaixia: 'Thầy Ni nói Phá Quân là sao phá cũ lập mới nhất, cũng là một trong những sao cô khắc nhất. Phá Quân Hóa Lộc mới trở nên tốt, đại diện có thể phá mà sau đó lập. Phá Quân tọa Mệnh lục thân duyên mỏng, nhưng khả năng khai sáng cực mạnh. Phá Quân phù hợp nhất cải cách, sáng tạo; khi Hóa Lộc thì tài vận chuyển vượng, một phá một lập, cuối cùng thành tựu sự nghiệp.',
    classical: 'Cổ quyết: «Phá Quân là sao phá cũ lập mới nhất, tọa Mệnh cô khắc, lục thân duyên mỏng, nhưng khai sáng năng lực siêu cường; Hóa Lộc sau thì phá mà sau lập, có thể thành đại nghiệp.» Nam Bắc Sơn Nhân chú: «Phá Quân thủ Mệnh, một đời nhiều sóng gió; Hóa Lộc thì phá tài sau mới trùng kiến, tài vận cuối cùng trở tốt, chủ tuổi già thành tựu.»',
    bestPalace: 'Quan Lộc (Hóa Lộc), Di Chuyển',
    worstPalace: 'Phu Thê, Phụ Mẫu',
    career: 'Khởi nghiệp khai sáng, quân cảnh, cải cách, quản lý biến đổi — phù hợp công việc tiên phong không ngừng mở ra lĩnh vực mới',
    relationship: 'Tình cảm nhiều sóng gió, ly hợp không định, lục thân duyên mỏng — cần chọn người độc lập và bao dung mạnh',
    wealth: 'Tài vận thăng trầm lớn, Hóa Lộc thì tài vận chuyển tốt — giữ thành thì tài lùi, cần không ngừng khai sáng mới tụ được tài',
    health: 'Hành Thủy — chú ý thận, bàng quang, hệ sinh dục. Thể chất thăng trầm, nên giữ thói quen vận động đều đặn',
  },
};

const levelConfig = {
  major: { label: 'Chính Tinh', color: 'text-amber-400 border-amber-500/30 bg-amber-500/10' },
  lucky: { label: 'Cát Tinh', color: 'text-sky-400 border-sky-500/30 bg-sky-500/10' },
  sha:   { label: 'Hung Tinh', color: 'text-red-400 border-red-500/30 bg-red-500/10' },
  minor: { label: 'Tạp Tinh', color: 'text-slate-400 border-slate-500/25 bg-slate-500/10' },
};

const siHuaColors: Record<string, string> = {
  '禄': 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
  '权': 'text-blue-400 bg-blue-500/10 border-blue-500/30',
  '科': 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30',
  '忌': 'text-red-400 bg-red-500/10 border-red-500/30',
};

export default function StarDetailPanel({ star, palaceName, onClose }: StarDetailPanelProps) {
  const desc = star ? STAR_DESCRIPTIONS[star.name] : null;
  const detail = star ? STAR_DETAIL[star.name] : null;
  const typeConfig = star ? levelConfig[star.type] : null;

  return (
    <AnimatePresence>
      {star && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          transition={{ duration: 0.2 }}
          className="card-glass rounded-xl overflow-hidden"
        >
          {/* 标题栏 */}
          <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid var(--t-border)' }}>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold" style={{ color: 'var(--t-gold)' }}>{STAR_NAME_VI[star.name] ?? star.name}</span>
              {typeConfig && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full border ${typeConfig.color}`}>
                  {typeConfig.label}
                </span>
              )}
              {star.siHua && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full border font-medium ${siHuaColors[star.siHua] || ''}`}>
                  Hóa {star.siHua === '禄' ? 'Lộc' : star.siHua === '权' ? 'Quyền' : star.siHua === '科' ? 'Khoa' : 'Kỵ'}
                </span>
              )}
            </div>
            <button onClick={onClose} className="transition-colors text-lg leading-none" style={{ color: 'var(--t-faint)' }}>×</button>
          </div>

          <div className="p-4 space-y-4 overflow-y-auto max-h-[560px]">
            {/* 基本信息 */}
            {desc && (
              <div className="flex flex-wrap gap-1.5">
                {[
                  `Ngũ Hành · ${desc.element}`,
                  `Tính Chất · ${desc.nature}`,
                  ...(palaceName ? [`Cương Vị · ${PALACE_NAME_VI[palaceName] ?? palaceName}`] : []),
                  ...(star.brightness ? [star.brightness === 'bright' ? 'Miếu Vượng' : star.brightness === 'dim' ? 'Lạc Hãm' : 'Bình Hòa'] : []),
                ].map(tag => (
                  <div key={tag} className="text-[10px] px-2 py-1 rounded-full"
                    style={{
                      border: '1px solid var(--t-border)',
                      color: tag.includes('Miếu Vượng') ? '#eab308' : tag.includes('Lạc Hãm') ? '#ef4444' : 'var(--t-text2)',
                    }}>
                    {tag}
                  </div>
                ))}
              </div>
            )}

            {/* 关键词 */}
            {desc && (
              <div>
                <div className="text-[10px] tracking-widest mb-1.5" style={{ color: 'var(--t-faint)' }}>Thần Tính Sao</div>
                <div className="flex flex-wrap gap-1.5">
                  {desc.keywords.split('·').map(k => (
                    <span key={k} className="text-[11px] px-2 py-0.5 rounded-full"
                      style={{ color: 'var(--t-gold)', border: '1px solid rgba(212,168,67,0.2)', background: 'rgba(212,168,67,0.06)' }}>
                      {k.trim()}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* 古书原文 */}
            {detail && (
              <div className="rounded-xl p-3" style={{ background: 'rgba(212,168,67,0.04)', border: '1px solid rgba(212,168,67,0.12)' }}>
                <div className="text-[10px] tracking-widest mb-1.5 flex items-center gap-1" style={{ color: 'var(--t-gold)', opacity: 0.7 }}>
                  Cổ Thư Nguyên Văn
                </div>
                <p className="text-[11px] leading-relaxed italic" style={{ color: 'var(--t-gold)', opacity: 0.8 }}>{detail.classical}</p>
              </div>
            )}

            {/* 倪海夏解读 */}
            {detail && (
              <>
                <div>
                  <div className="text-[10px] tracking-widest mb-1.5 flex items-center gap-1.5" style={{ color: 'var(--t-faint)' }}>
                    <span className="w-3 h-px inline-block" style={{ background: 'var(--t-border-acc)' }} />
                    Thầy Ni Hải Hạ Giải Thích
                    <span className="w-3 h-px inline-block" style={{ background: 'var(--t-border-acc)' }} />
                  </div>
                  <p className="text-xs leading-relaxed" style={{ color: 'var(--t-text2)' }}>{detail.niHaixia}</p>
                </div>

                <div className="grid grid-cols-1 gap-2">
                  {[
                    { label: 'Hướng Nghề Nghiệp', value: detail.career, icon: '◈' },
                    { label: 'Tình Cảm Ái Tình', value: detail.relationship, icon: '♡' },
                    { label: 'Phân Tích Tài Vận', value: detail.wealth, icon: '◆' },
                    { label: 'Lưu Ý Sức Khỏe', value: detail.health, icon: '☯' },
                  ].map(item => (
                    <div key={item.label} className="card-inner rounded-lg p-3">
                      <div className="text-[10px] mb-1 flex items-center gap-1" style={{ color: 'var(--t-faint)' }}>
                        <span>{item.icon}</span>
                        <span>{item.label}</span>
                      </div>
                      <p className="text-[11px] leading-relaxed" style={{ color: 'var(--t-text2)' }}>{item.value}</p>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="text-[10px] p-2.5 rounded-lg" style={{ border: '1px solid rgba(74,222,128,0.15)', background: 'rgba(74,222,128,0.05)' }}>
                    <div className="text-emerald-500 mb-0.5 font-medium">Cung Vị Tốt Nhất</div>
                    <div className="text-emerald-500/70">{detail.bestPalace}</div>
                  </div>
                  <div className="text-[10px] p-2.5 rounded-lg" style={{ border: '1px solid rgba(248,113,113,0.15)', background: 'rgba(248,113,113,0.05)' }}>
                    <div className="text-red-500 mb-0.5 font-medium">Cung Cần Chú Ý</div>
                    <div className="text-red-500/70">{detail.worstPalace}</div>
                  </div>
                </div>
              </>
            )}

            {/* 辅星/煞星说明 */}
            {!detail && star.type !== 'major' && (
              <div className="text-xs leading-relaxed" style={{ color: 'var(--t-text2)' }}>
                {star.type === 'lucky' && (
                  <>
                    {star.name === '文昌' && '文昌入宫，主学业考试顺利，文书印鉴有利，宜从事文字相关工作。古诀：「文昌科甲，主文章显达，逢考必第。」'}
                    {star.name === '文曲' && '文曲入宫，主才艺出众，口才佳，善于表达，艺术天赋强。古诀：「文曲为才艺之星，能文能武，口才胜人。」'}
                    {star.name === '左辅' && '左辅入宫，主贵人相助，有人提携，该宫位事项受到善意支持。古诀：「左辅为助力之星，坐命则贵人多，逢凶化吉。」'}
                    {star.name === '右弼' && '右弼入宫，主贵人相助，多出女性贵人，该宫位事项有人协助。古诀：「右弼为阴助之星，多女性贵人，化险为夷。」'}
                    {star.name === '天魁' && '天魁入宫，主白天出生的贵人，男性贵人多，逢凶化吉之力。古诀：「天魁为天乙贵人，逢之必有贵人扶持。」'}
                    {star.name === '天钺' && '天钺入宫，主夜晚出生的贵人，女性贵人多，增添吉祥之气。古诀：「天钺为玉堂贵人，主阴助，女贵人多。」'}
                    {star.name === '禄存' && '禄存入宫，主财禄守成，该宫位有财气，但属于保守型财运。古诀：「禄存为财禄之星，主守财有余，进财稳健。」'}
                    {star.name === '天马' && '天马入宫，主奔波动荡，动中求财，宜主动出击，不宜守株待兔。古诀：「天马主动，逢禄则财禄双全，动中生财。」'}
                  </>
                )}
                {star.type === 'sha' && (
                  <>
                    {star.name === '地空' && '地空入宫，主该宫位事项有落空感，精神耗散，宜注意心理健康。古诀：「地空主虚耗，入命宫者多精神迷茫，须防空想。」'}
                    {star.name === '地劫' && '地劫入宫，主该宫位事项有意外损失，财物需谨慎，防小人。古诀：「地劫主劫财，入命宫者财运受损，防意外之失。」'}
                    {star.name === '火星' && '火星入宫，主该宫位事项急躁冲动，情绪波动，但若遇贪狼则反吉。古诀：「火星主急燥，然遇贪狼同宫，反为火贪格，主暴发。」'}
                    {star.name === '铃星' && '铃星入宫，主该宫位事项有暗中阻碍，防背后小人，凡事宜低调。古诀：「铃星主暗煞，入命者多暗中受敌，须防背后是非。」'}
                    {star.name === '擎羊' && '擎羊入宫，主刑克，该宫位事项多波折，有血光之灾或意外。古诀：「擎羊为刑克之星，入命宫者多刑克，须防意外血光。」'}
                    {star.name === '陀罗' && '陀罗入宫，主是非缠身，该宫位事项拖延不决，凡事宜早做准备。古诀：「陀罗主是非拖延，入命宫者做事迟缓，须防纠缠不清。」'}
                  </>
                )}
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
