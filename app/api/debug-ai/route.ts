import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
  const provider = process.env.AI_PROVIDER || 'openai';
  let apiKey = '';
  let baseUrl = '';
  let model = '';

  if (provider === 'deepseek') {
    apiKey = process.env.DEEPSEEK_API_KEY || '';
    baseUrl = 'https://api.deepseek.com';
    model = 'deepseek-chat';
  }

  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'No API key', provider }), {
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const res = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: 'Xin chào' }],
        max_tokens: 10,
      }),
    });

    const text = await res.text();
    return new Response(JSON.stringify({
      status: res.status,
      ok: res.ok,
      provider,
      baseUrl,
      model,
      response: text.substring(0, 500),
    }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), {
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
