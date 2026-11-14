import { NextResponse } from 'next/server';
import { STATELESS, slGenres } from '@/lib/stateless';
import { db } from '@/lib/db';

// GET /api/genres — التصنيفات
export async function GET() {
  if (STATELESS) return slGenres();
  const genres = await db.genre.findMany({ orderBy: { slug: 'asc' } });
  return NextResponse.json({
    ok: true,
    data: genres.map((g: any) => ({ slug: g.slug, nameAr: g.nameAr, nameEn: g.nameEn })),
  });
}
