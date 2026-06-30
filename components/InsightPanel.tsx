'use client';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { ZiweiChart, Palace } from '@/lib/ziwei/types';
import type { TimeView } from './TimeNav';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  hidden?: boolean; // don't show user bubble for auto/topic messages
}

interface SelectedSiHua {
  starName: string;
  siHua: string;
  view: TimeView;
}

interface InsightPanelProps {
  chart: ZiweiChart;
  selectedPalace?: Palace | null;
  selectedSiHua?: SelectedSiHua | null;
}

const TOPICS = [
  { key: 'overview',     label: 'Mệnh Cách' },
  { key: 'love',        label: 'Tình Duyên' },
  { key: 'career',      label: 'Sự Nghiệp' },
  { key: 'wealth',      label: 'Tài Vận' },
  { key: 'health',      label: 'Sức Khỏe' },
  { key: 'personality', label: 'Tính Cách' },
] as const;

const TOPIC_PROMPTS: Record<string, string> = {
  overview: `Hãy tạo bản tổng quan mệnh cách, xuất ra theo cấu trúc sau:

**【Định Tính Mệnh Cách】**
Tóm tắt bằng một câu về cốt lõi mệnh cách và khí chất của đương số.

**【Giải Mã Chính Tinh】**
Đặc điểm cốt lõi của chính tinh tại cung Mệnh, dựa theo quan điểm của Ni Hải Hạ.

**【Tam Phương Tứ Chính】**
Phân tích sự liên kết của 3 cung Tài Bạch, Quan Lộc, Thiên Di và cục diện tổng thể.

**【Đại Hạn Hiện Tại】**
Hướng đi của đại hạn hiện tại và những điều đáng chú ý nhất.

**【Ưu Điểm & Lưu Ý】**
Ưu điểm thiên phú của mệnh bàn, cùng những rủi ro hoặc bài học cần lưu ý.`,

  love: `Hãy phân tích chuyên sâu về tình duyên và hôn nhân, xuất ra theo cấu trúc sau:

**【Cục Diện Tình Duyên】**
Định tính về mệnh cách tình duyên trong một câu.

**【Phân Tích Cung Phu Thê】**
Chính tinh, tứ hóa của cung Phu Thê và giải thích cụ thể theo hệ thống Ni Hải Hạ.

**【Liên Kết Tam Phương】**
Ảnh hưởng của các cung liên quan đến tình cảm.

**【Tình Duyên Đại Hạn Hiện Tại】**
Diễn biến tình cảm trong 10 năm tới và các cột mốc quan trọng.

**【Lời Khuyên Thực Tế】**
Những lời khuyên cụ thể, khả thi về mặt tình cảm.`,

  career: `Hãy phân tích chuyên sâu về sự nghiệp, xuất ra theo cấu trúc sau:

**【Cục Diện Sự Nghiệp】**
Định tính sự nghiệp trong một câu, hợp làm thuê hay làm chủ.

**【Phân Tích Cung Quan Lộc】**
Chính tinh, tứ hóa của cung Quan Lộc và đánh giá của thầy Ni về cục diện này.

**【Liên Kết Cung Tài Bạch】**
Mối quan hệ giữa tài vận và sự nghiệp, phân tích nguồn tiền tài.

**【Sự Nghiệp Đại Hạn Hiện Tại】**
Diễn biến sự nghiệp trong 10 năm hiện tại.

**【Lời Khuyên Thực Tế】**
Định hướng, ngành nghề và chiến lược phù hợp.`,

  wealth: `Hãy phân tích chuyên sâu về tài vận, xuất ra theo cấu trúc sau:

**【Cục Diện Tài Vận】**
Định tính mô hình tài vận trong một câu, là tài lộc chủ động hay thụ động.

**【Phân Tích Cung Tài Bạch】**
Chính tinh, tứ hóa cung Tài Bạch, nguồn gốc và mô hình luân chuyển của cải.

**【Cung Điền Trạch (Tài Khố)】**
Phân tích khả năng tích lũy và vận thế bất động sản.

**【Tài Vận Đại Hạn Hiện Tại】**
Diễn biến tài vận hiện tại và những điều cần lưu ý.

**【Lời Khuyên Lý Tài】**
Những lời khuyên cụ thể về tài chính.`,

  health: `Hãy phân tích vận thế sức khỏe, xuất ra theo cấu trúc sau:

**【Chính Tinh Cung Tật Ách】**
Ý nghĩa của các sao tại cung Tật Ách đối với sức khỏe.

**【Rủi Ro Chính】**
Kết hợp với lý thuyết Tý Ngọ Lưu Chú của Ni Hải Hạ, phân tích các nguy cơ sức khỏe tiềm ẩn và bộ phận cần chú ý.

**【Sức Khỏe Đại Hạn】**
Xu hướng sức khỏe hiện tại và các khoảng thời gian quan trọng.

**【Lời Khuyên Phòng Ngừa】**
Những lưu ý cụ thể và phương hướng dưỡng sinh.`,

  personality: `Hãy phân tích chuyên sâu về đặc điểm tính cách, xuất ra theo cấu trúc sau:

**【Tính Cách Chính Tinh Cung Mệnh】**
Đặc điểm tính cách cốt lõi của chính tinh cung Mệnh, dẫn lời thầy Ni Hải Hạ.

**【Tổng Hợp Tính Cách Tam Phương】**
Ảnh hưởng của 3 cung Tài, Quan, Di đối với tính cách, phác họa bức tranh toàn cảnh.

**【Mô Hình Quan Hệ Xã Hội】**
Cách thức tương tác với người khác và phong cách đối nhân xử thế.

**【Ưu Điểm & Bài Học Cuộc Đời】**
Ưu điểm thiên phú, cùng những bài học cuộc đời cần phải đối mặt.`,
};

const PALACE_ROLES: Record<string, string> = {
  '命宫':   'Bản ngã, tính cách, mệnh cách bẩm sinh',
  '兄弟宫': 'Mối quan hệ anh em, đối tác',
  '夫妻宫': 'Tình cảm, trạng thái hôn nhân',
  '子女宫': 'Duyên phận con cái, mối quan hệ cấp dưới',
  '财帛宫': 'Nguồn tài vận, phương thức thu nhập',
  '疾厄宫': 'Sức khỏe, tai nạn',
  '迁移宫': 'Cơ hội bên ngoài, cục diện nhân duyên',
  '交友宫': 'Vòng bạn bè, quý nhân, tiểu nhân',
  '官禄宫': 'Thành tựu sự nghiệp, địa vị xã hội',
  '田宅宫': 'Bất động sản, môi trường gia đình',
  '福德宫': 'Hưởng thụ tinh thần, phúc phận nội tâm',
  '父母宫': 'Mối quan hệ cha mẹ, văn thư hợp đồng',
};

/** Render AI markdown: **【Title】** → gold header, **bold** → strong */
function AiContent({ text, streaming }: { text: string; streaming?: boolean }) {
  const lines = text.split('\n');
  return (
    <div className="space-y-0.5">
      {lines.map((line, i) => {
        const sectionMatch = line.match(/^\*\*【(.+?)】\*\*$/);
        if (sectionMatch) {
          return (
            <div key={i} className="pt-3 pb-0.5 first:pt-0">
              <span className="text-[11px] font-semibold tracking-wide" style={{ color: 'var(--t-gold)' }}>
                【{sectionMatch[1]}】
              </span>
            </div>
          );
        }
        if (line.trim() === '') return <div key={i} className="h-1" />;
        const parts = line.split(/\*\*(.+?)\*\*/);
        return (
          <div key={i} className="text-[11px] leading-relaxed" style={{ color: 'var(--t-text2)' }}>
            {parts.map((part, j) =>
              j % 2 === 0
                ? part
                : <strong key={j} className="font-medium" style={{ color: 'var(--t-text)' }}>{part}</strong>
            )}
          </div>
        );
      })}
      {streaming && (
        <span
          className="inline-block w-1.5 h-3 ml-0.5 animate-pulse rounded-sm align-middle"
          style={{ background: 'var(--t-gold)', opacity: 0.6 }}
        />
      )}
    </div>
  );
}

export default function InsightPanel({ chart, selectedPalace, selectedSiHua }: InsightPanelProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTopic, setActiveTopic] = useState<string>('overview');
  const messagesRef = useRef<Message[]>([]); // always-current copy for closures
  const loadingRef = useRef(false);
  const autoLoaded = useRef(false);
  const lastPalaceBranch = useRef<number | undefined>(undefined);
  const lastSiHuaKey = useRef<string | undefined>(undefined);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Keep refs in sync
  useEffect(() => { messagesRef.current = messages; }, [messages]);
  useEffect(() => { loadingRef.current = loading; }, [loading]);

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Auto-generate 命格总览 on mount
  useEffect(() => {
    if (autoLoaded.current) return;
    autoLoaded.current = true;
    sendMessage(TOPIC_PROMPTS.overview, true);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Inject palace analysis when palace selected
  useEffect(() => {
    if (!selectedPalace || selectedPalace.branch === lastPalaceBranch.current) return;
    lastPalaceBranch.current = selectedPalace.branch;

    const majorStars = selectedPalace.stars.filter(s => s.type === 'major');
    const starDesc = majorStars.length > 0
      ? majorStars.map(s => `${s.name}${s.siHua ? '化' + s.siHua : ''}`).join('、')
      : '空宫（借对宫）';
    const role = PALACE_ROLES[selectedPalace.name] ?? '';

    const prompt = `Hãy tập trung phân tích 【${selectedPalace.name}】 (Chủ quản: ${role}), chính tinh của cung này là ${starDesc}, xuất ra theo cấu trúc sau:

**【Định Tính Cung Vị】**
Ý nghĩa của ${selectedPalace.name} trong mệnh bàn, cùng với đánh giá tổng thể về cách bố trí các sao này.

**【Giải Mã Chính Tinh】**
Phân tích chính tinh tại cung này theo hệ thống Ni Hải Hạ, trình bày khách quan dựa trên dữ liệu lá số.

**【Liên Kết Tam Phương Tứ Chính】**
Ảnh hưởng của các cung tam phương tứ chính đối với cung này.

**【Lời Khuyên Thực Tế】**
Những lời khuyên cụ thể dựa trên cung này.`;

    sendMessage(prompt, true, true);
  }, [selectedPalace]); // eslint-disable-line react-hooks/exhaustive-deps

  // 注入四化飞化分析
  useEffect(() => {
    if (!selectedSiHua) return;
    const key = `${selectedSiHua.starName}-${selectedSiHua.siHua}-${selectedSiHua.view}`;
    if (key === lastSiHuaKey.current) return;
    lastSiHuaKey.current = key;

    // 找出该星所在宫位
    const palaceOfStar = chart.palaces.find(p =>
      p.stars.some(s => s.name === selectedSiHua.starName)
    );
    const palaceName = palaceOfStar?.name ?? '未知宫位';
    const viewLabel = selectedSiHua.view === 'daxian' ? 'Đại hạn' : 'Lưu niên';

    const prompt = `Hãy phân tích ảnh hưởng của phi hóa 【${viewLabel} ${selectedSiHua.starName} Hóa ${selectedSiHua.siHua}】, xuất ra theo cấu trúc sau:

**【Ý Nghĩa Cơ Bản Của Hóa ${selectedSiHua.siHua}】**
Ý nghĩa cốt lõi của Hóa ${selectedSiHua.siHua} trong hệ thống Ni Hải Hạ, và ý nghĩa đặc biệt khi ${selectedSiHua.starName} Hóa ${selectedSiHua.siHua}.

**【Ảnh Hưởng Cung Rơi Vào】**
${selectedSiHua.starName} Hóa ${selectedSiHua.siHua} rơi vào 【${palaceName}】, lĩnh vực do cung này quản lý chịu ảnh hưởng gì, phân tích khách quan dựa trên dữ liệu.

**【Đường Đi Phi Hóa Tam Phương Tứ Chính】**
Sau khi Hóa ${selectedSiHua.siHua} nhập ${palaceName}, ảnh hưởng liên đới đến tam phương tứ chính (cung đối, hai cung tam hợp) của nó.

**【Ảnh Hưởng Vận Thế Hiện Tại】**
Ở khía cạnh thời gian ${viewLabel}, việc Hóa ${selectedSiHua.siHua} này có ảnh hưởng cụ thể gì đến vận thế gần đây của đương số.

**【Lời Khuyên Thực Tế】**
Những lời khuyên cụ thể, có thể thực hiện được dựa trên Tứ Hóa này.`;

    sendMessage(prompt, true, true);
  }, [selectedSiHua]); // eslint-disable-line react-hooks/exhaustive-deps

  const streamResponse = async (apiMessages: { role: 'user' | 'assistant'; content: string }[]) => {
    try {
      const res = await fetch('/api/interpret', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chart, messages: apiMessages }),
      });
      if (!res.ok) throw new Error('请求失败');
      if (!res.body) throw new Error('无响应流');

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let assistantText = '';
      let buffer = '';

      setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';

        let hasUpdates = false;
        for (const line of lines) {
          const trimmedLine = line.trim();
          if (!trimmedLine.startsWith('data:')) continue;
          const data = trimmedLine.replace(/^data:\s*/, '');
          if (data === '[DONE]') break;
          try {
            const parsed = JSON.parse(data);
            const delta = parsed.choices?.[0]?.delta?.content ?? parsed.delta?.text ?? parsed.delta?.content ?? '';
            if (delta) {
              assistantText += delta;
              hasUpdates = true;
            }
          } catch { /* skip */ }
        }

        if (hasUpdates) {
          setMessages(prev => {
            const updated = [...prev];
            updated[updated.length - 1] = { role: 'assistant', content: assistantText };
            return updated;
          });
        }
      }
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Tính năng giải đoán AI chưa được cấu hình. (Để sử dụng, vui lòng thiết lập API Key)' }]);
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  };

  const sendMessage = (text: string, hidden = false, clearHistory = false) => {
    if (!text.trim() || loadingRef.current) return;
    loadingRef.current = true;
    setLoading(true);

    const userMsg: Message = { role: 'user', content: text, hidden };
    const baseMessages = clearHistory ? [] : messagesRef.current;
    
    const apiMessages = [...baseMessages, userMsg].map(m => ({
      role: m.role,
      content: m.content,
    }));

    if (clearHistory) {
      setMessages([userMsg]);
      messagesRef.current = [userMsg];
    } else {
      setMessages(prev => [...prev, userMsg]);
    }
    
    setInput('');
    streamResponse(apiMessages);
  };

  const handleTopicClick = (topicKey: string) => {
    if (loadingRef.current) return;
    setActiveTopic(topicKey);
    sendMessage(TOPIC_PROMPTS[topicKey], true, true);
  };

  const handleSend = () => {
    sendMessage(input);
  };

  const handleClear = () => {
    setMessages([]);
    messagesRef.current = [];
    setInput('');
  };

  return (
    <div className="flex flex-col h-full rounded-xl overflow-hidden card-glass">

      {/* ── Topic buttons ── */}
      <div className="flex-shrink-0 px-2 pt-2.5 pb-2" style={{ borderBottom: '1px solid var(--t-border)' }}>
        <div className="grid grid-cols-6 gap-1">
          {TOPICS.map(t => {
            const isActive = activeTopic === t.key;
            return (
              <button
                key={t.key}
                onClick={() => handleTopicClick(t.key)}
                disabled={loading}
                className="py-1.5 text-[10px] font-medium rounded-lg transition-all duration-150 disabled:opacity-40"
                style={{
                  background: isActive ? 'rgba(212,168,67,0.12)' : 'transparent',
                  border: `1px solid ${isActive ? 'rgba(212,168,67,0.3)' : 'var(--t-border)'}`,
                  color: isActive ? 'var(--t-gold)' : 'var(--t-faint)',
                }}
              >
                {t.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Messages ── */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">

        {/* Loading state before first message */}
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="text-4xl mb-3" style={{ color: 'var(--t-gold)', opacity: 0.1 }}>✦</div>
            <p className="text-[10px] animate-pulse" style={{ color: 'var(--t-faint)' }}>Đang tạo giải đọc mệnh cách…</p>
          </div>
        )}

        <AnimatePresence initial={false}>
          {messages.map((msg, i) => {
            if (msg.role === 'user' && msg.hidden) return null;

            if (msg.role === 'user') {
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-end"
                >
                  <div
                    className="max-w-[85%] rounded-2xl rounded-tr-sm px-4 py-2.5 text-[12px] shadow-sm"
                    style={{
                      background: 'var(--ac-bg)',
                      border: '1px solid var(--ac-bdr)',
                      color: 'var(--ac)',
                    }}
                  >
                    {msg.content}
                  </div>
                </motion.div>
              );
            }

            // Assistant message
            const isLastMsg = i === messages.length - 1;
            const isStreaming = isLastMsg && loading;

            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-start gap-3"
              >
                <div className="w-7 h-7 mt-1 rounded-full bg-[var(--bg-inv)] flex items-center justify-center flex-shrink-0 shadow-md">
                  <span className="text-[var(--tx-inv)] text-[10px] font-bold">AI</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="max-w-[95%] rounded-2xl rounded-tl-sm px-4 py-3 text-[13px] leading-relaxed glass shadow-md ai-content-block">
                    <AiContent text={msg.content} streaming={isStreaming} />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* ── Input ── */}
      <div className="flex-shrink-0 px-3 pb-3 pt-2" style={{ borderTop: '1px solid var(--t-border)' }}>
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
            placeholder="Tiếp tục hỏi, ví dụ: Năm nay có nên chuyển việc không?"
            disabled={loading}
            className="flex-1 rounded-lg px-3 py-2 text-[11px] focus:outline-none transition-colors"
            style={{
              background: 'var(--t-card)',
              border: '1px solid var(--t-border)',
              color: 'var(--t-text)',
            }}
          />
          <button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="px-3 py-2 rounded-lg text-[11px] font-medium transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            style={{
              background: 'rgba(212,168,67,0.15)',
              border: '1px solid rgba(212,168,67,0.25)',
              color: 'var(--t-gold)',
            }}
          >
            {loading ? '…' : 'Hỏi thêm'}
          </button>
        </div>
      </div>

    </div>
  );
}
