import { NextRequest } from 'next/server';
import { generateChart } from '@/lib/ziwei/algorithm';
import { calcTrueSolarBranch } from '@/lib/ziwei/share';

export const runtime = 'edge';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { year, month, day, hour, clockMinute, gender, name, province, city, longitude } = body;

    if (!year || !month || !day || !gender) {
      return new Response(JSON.stringify({ error: 'Thiếu thông tin bắt buộc' }), { status: 400 });
    }

    let hourBranch = typeof hour === 'number' ? hour : 0;
    if (longitude && typeof hour === 'number') {
      const clockHour = Math.floor(hour);
      const mins = typeof clockMinute === 'number' ? clockMinute : 0;
      hourBranch = calcTrueSolarBranch(clockHour, mins, longitude);
    }

    const chart = generateChart({
      year,
      month,
      day,
      hour: hourBranch,
      gender,
      name,
      province,
      city,
      longitude,
    });

    return new Response(JSON.stringify(chart), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('Chart generation error:', error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
