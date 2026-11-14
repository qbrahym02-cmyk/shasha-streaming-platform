import { NextRequest, NextResponse } from 'next/server';
import { STATELESS, slTitleDetail } from '@/lib/stateless';
import { db } from '@/lib/db';
import { getRequestUser, isVip } from '@/lib/auth';
import { mapTitle } from '@/lib/catalog';

// GET /api/titles/[slug] — تفاصيل العمل
export async function GET(req: NextRequest, ctx: { params: Promise<{ slug: string }> }) {
  const { slug } = await ctx.params;
  if (STATELESS) return slTitleDetail(req, slug);
  try {
    const title = await db.title.findUnique({
      where: { slug },
      include: {
        genres: { include: { genre: true } },
        episodes: { orderBy: [{ season: 'asc' }, { number: 'asc' }] },
      },
    });
    if (!title) {
      return NextResponse.json({ ok: false, error: 'العمل غير موجود' }, { status: 404 });
    }

    const user = await getRequestUser(req);
    const base = await mapTitle(title, user?.id ?? null);

    // أعمال مشابهة (تشابه التصنيفات)
    const genreIds = title.genres.map((g: any) => g.genreId);
    const similarRaw = await db.title.findMany({
      where: { id: { not: title.id }, genres: { some: { genreId: { in: genreIds } } } },
      take: 8,
      orderBy: [{ score: 'desc' }],
      include: { genres: { include: { genre: true } } },
    });
    const similar = similarRaw.map((t: any) => ({
      id: t.id,
      slug: t.slug,
      type: t.type,
      titleAr: t.titleAr,
      titleEn: t.titleEn,
      poster: t.poster,
      backdrop: t.backdrop,
      year: t.year,
      ageRating: t.ageRating,
      score: t.score,
      durationMin: t.durationMin,
      isPremium: t.isPremium,
      releaseState: t.releaseState,
      trending: t.trending,
      genres: t.genres.map((g: any) => ({ slug: g.genre.slug, nameAr: g.genre.nameAr, nameEn: g.genre.nameEn })),
      inWatchlist: false,
      progressPct: 0,
    }));

    const episodes = title.episodes.map((e: any) => ({
      id: e.id,
      season: e.season,
      number: e.number,
      nameAr: e.nameAr,
      nameEn: e.nameEn,
      durationMin: e.durationMin,
      isPremium: e.isPremium,
    }));

    return NextResponse.json({
      ok: true,
      data: {
        ...base,
        synopsisAr: title.synopsisAr,
        synopsisEn: title.synopsisEn,
        episodes,
        similar,
        canPlayVip: user ? isVip(user) : false,
      },
    });
  } catch (e) {
    console.error('title detail error', e);
    return NextResponse.json({ ok: false, error: 'حدث خطأ ما' }, { status: 500 });
  }
}
