import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function POST(req: NextRequest) {
  try {
    const { chart, messages } = await req.json();

    const provider = process.env.AI_PROVIDER || 'openai';
    
    let apiKey = '';
    let baseUrl = '';
    let model = '';

    if (provider === 'deepseek') {
      apiKey = process.env.DEEPSEEK_API_KEY || '';
      baseUrl = 'https://api.deepseek.com/v1';
      model = 'deepseek-chat';
    } else if (provider === 'mimo') {
      apiKey = process.env.MIMO_API_KEY || '';
      baseUrl = process.env.MIMO_BASE_URL || 'https://api.openai.com/v1';
      model = process.env.MIMO_MODEL || 'gpt-3.5-turbo';
    } else {
      apiKey = process.env.OPENAI_API_KEY || '';
      baseUrl = 'https://api.openai.com/v1';
      model = 'gpt-3.5-turbo';
    }

    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'API Key not configured' }), { status: 401 });
    }

    const payload = {
      model: model,
      messages: [
        {
          role: 'system',
          content: `Bạn là một chuyên gia về Tử Vi Đẩu Số (trường phái Ni Hải Hạ). Đây là thông tin lá số của đương số:\n\n${JSON.stringify(chart)}\n\nHãy giải đoán chi tiết, logic và sử dụng kiến thức Tử Vi chuyên sâu để trả lời câu hỏi của người dùng. Trả lời hoàn toàn bằng tiếng Việt. Không đề cập đến quan điểm cá nhân hay bất kỳ ai — chỉ phân tích khách quan dựa trên dữ liệu lá số.`
        },
        ...messages
      ],
      stream: true,
    };

    const response = await fetch(`${baseUrl.replace(/\/+$/, '')}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('AI API Error:', errText);
      return new Response(JSON.stringify({ error: `Upstream error: ${errText}` }), { status: response.status });
    }

    return new Response(response.body, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error: any) {
    console.error('Internal Error:', error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
