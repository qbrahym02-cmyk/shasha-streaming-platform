import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/plans — باقات VIP
export async function GET() {
  const plans = await db.plan.findMany({ orderBy: { months: 'asc' } });
  return NextResponse.json({
    ok: true,
    data: plans.map((p: any) => ({
      code: p.code,
      nameAr: p.nameAr,
      nameEn: p.nameEn,
      priceDzd: p.priceDzd,
      originalDzd: p.originalDzd,
      months: p.months,
      featuresAr: JSON.parse(p.featuresAr || '[]'),
      featuresEn: JSON.parse(p.featuresEn || '[]'),
      highlight: p.highlight,
    })),
  });
}
