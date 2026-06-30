import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
  const provider = process.env.AI_PROVIDER || 'not set';
  const deepseekKey = process.env.DEEPSEEK_API_KEY;
  
  return new Response(JSON.stringify({
    provider,
    hasDeepseekKey: !!deepseekKey,
    deepseekKeyLength: deepseekKey?.length ?? 0,
    deepseekKeyPrefix: deepseekKey?.substring(0, 8) ?? 'none',
  }), {
    headers: { 'Content-Type': 'application/json' },
  });
}
