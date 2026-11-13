import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getRequestUser } from '@/lib/auth';
import { userFlagsForTitles } from '@/lib/catalog';
import type { Prisma } from '@prisma/client';

// GET /api/titles?type=MOVIE&genre=action&q=..&section=trending|vip|new|anime&sort=popular|rated|newest&limit=20
export async function GET(req: NextRequest) {
  try {
    const sp = req.nextUrl.searchParams;
    const type = sp.get('type');
    const genre = sp.get('genre');
    const q = sp.get('q');
    const section = sp.get('section');
    const sort = sp.get('sort') || 'popular';
    const limit = Math.min(60, parseInt(sp.get('limit') || '24', 10) || 24);

    const where: Prisma.TitleWhereInput = {};
    if (type) where.type = type;
    if (genre) where.genres = { some: { genre: { slug: genre } } };
    if (section === 'vip') where.isPremium = true;
    if (section === 'featured') where.featured = true;
    if (section === 'trending') where.trending = { not: null };
    if (q) {
      where.OR = [
        { titleAr: { contains: q } },
        { titleEn: { contains: q } },
        { synopsisAr: { contains: q } },
        { synopsisEn: { contains: q } },
      ];
    }

    let orderBy: Prisma.TitleOrderByWithRelationInput[] = [{ score: 'desc' }, { year: 'desc' }];
    if (section === 'trending') orderBy = [{ trending: 'asc' }];
    else if (sort === 'rated') orderBy = [{ score: 'desc' }];
    else if (sort === 'newest') orderBy = [{ year: 'desc' }];

    const titles = await db.title.findMany({
      where,
      orderBy,
      take: limit,
      include: { genres: { include: { genre: true } } },
    });

    const user = await getRequestUser(req);
    const mapped = titles.map((t: any) => ({
      id: t.id,
      slug: t.slug,
      type: t.type,
      titleAr: t.titleAr,
      titleEn: t.titleEn,
      synopsisAr: t.synopsisAr,
      synopsisEn: t.synopsisEn,
      poster: t.poster,
      backdrop: t.backdrop,
      year: t.year,
      ageRating: t.ageRating,
      score: t.score,
      durationMin: t.durationMin,
      isPremium: t.isPremium,
      releaseState: t.releaseState,
      trending: t.trending,
      featured: t.featured,
      genres: t.genres.map((g: any) => ({ slug: g.genre.slug, nameAr: g.genre.nameAr, nameEn: g.genre.nameEn })),
    }));

    const withFlags = await userFlagsForTitles(mapped, user?.id ?? null);
    return NextResponse.json({ ok: true, data: withFlags });
  } catch (e) {
    console.error('titles error', e);
    return NextResponse.json({ ok: false, error: 'حدث خطأ ما' }, { status: 500 });
  }
}
