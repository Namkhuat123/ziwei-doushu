import { NextRequest } from 'next/server';
import { generateChart } from '@/lib/ziwei/algorithm';
import { calcTrueSolarBranch } from '@/lib/ziwei/share';
import { PALACE_NAME_VI, STAR_NAME_VI } from '@/lib/ziwei/constants';

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

    const translated = {
      ...chart,
      palaces: chart.palaces.map(p => ({
        ...p,
        nameVi: PALACE_NAME_VI[p.name] ?? p.name,
        stars: p.stars.map(s => ({
          ...s,
          nameVi: STAR_NAME_VI[s.name] ?? s.name,
        })),
      })),
      daXians: (chart.daXians || []).map((dx: any) => ({
        ...dx,
        palaceNameVi: PALACE_NAME_VI[dx.palaceName] ?? dx.palaceName,
      })),
      palaceNameVi: PALACE_NAME_VI,
      starNameVi: STAR_NAME_VI,
    };

    return new Response(JSON.stringify(translated), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('Chart generation error:', error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
