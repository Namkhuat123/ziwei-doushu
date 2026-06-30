import { NextRequest } from 'next/server';
import { generateChart } from '@/lib/ziwei/algorithm';

export const runtime = 'edge';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const chart = generateChart({
    year: 2004, month: 4, day: 3, hour: 2, gender: 'male',
  });
  
  return new Response(JSON.stringify({
    keys: Object.keys(chart),
    birthInfoKeys: Object.keys(chart.birthInfo),
    palacesCount: chart.palaces.length,
    firstPalace: chart.palaces[0],
    firstPalaceKeys: Object.keys(chart.palaces[0]),
    firstPalaceStars: chart.palaces[0].stars,
  }), {
    headers: { 'Content-Type': 'application/json' },
  });
}
