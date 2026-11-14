import { NextRequest, NextResponse } from 'next/server';
import { STATELESS, slProgressGet, slProgressPost } from '@/lib/stateless';
import { db } from '@/lib/db';
import { getRequestUser } from '@/lib/auth';
import { userFlagsForTitles } from '@/lib/catalog';

// GET /api/progress — متابعة المشاهدة (قائمة)
// GET /api/progress?slug=x — موضع توقف محدد
export async function GET(req: NextRequest) {
  if (STATELESS) return slProgressGet(req);
  const user = await getRequestUser(req);
  if (!user) return NextResponse.json({ ok: true, data: { list: [], single: null } });

  const slug = req.nextUrl.searchParams.get('slug');
  if (slug) {
    const title = await db.title.findUnique({ where: { slug } });
    if (!title) return NextResponse.json({ ok: true, data: { list: [], single: null } });
    const progress = await db.watchProgress.findUnique({
      where: { userId_titleId: { userId: user.id, titleId: title.id } },
    });
    return NextResponse.json({ ok: true, data: { list: [], single: progress } });
  }

  const items = await db.watchProgress.findMany({
    where: { userId: user.id, positionSec: { gt: 5 } },
    orderBy: { updatedAt: 'desc' },
    take: 12,
    include: { title: { include: { genres: { include: { genre: true } } } } },
  });

  const mapped = items.map((i: any) => ({
    id: i.title.id,
    slug: i.title.slug,
    type: i.title.type,
    titleAr: i.title.titleAr,
    titleEn: i.title.titleEn,
    poster: i.title.poster,
    backdrop: i.title.backdrop,
    year: i.title.year,
    ageRating: i.title.ageRating,
    score: i.title.score,
    durationMin: i.title.durationMin,
    isPremium: i.title.isPremium,
    releaseState: i.title.releaseState,
    trending: i.title.trending,
    genres: i.title.genres.map((g: any) => ({ slug: g.genre.slug, nameAr: g.genre.nameAr, nameEn: g.genre.nameEn })),
    progressEpisodeId: i.episodeId,
  }));
  const withFlags = await userFlagsForTitles(mapped, user.id);
  return NextResponse.json({ ok: true, data: { list: withFlags, single: null } });
}

// POST /api/progress — حفظ موضع المشاهدة
export async function POST(req: NextRequest) {
  if (STATELESS) return slProgressPost(req);
  const user = await getRequestUser(req);
  if (!user) return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });

  const body = await req.json().catch(() => null);
  const slug = String(body?.slug || '');
  const episodeId = body?.episodeId ? String(body.episodeId) : null;
  const positionSec = Math.max(0, Number(body?.positionSec) || 0);
  const durationSec = Math.max(0, Number(body?.durationSec) || 0);

  const title = await db.title.findUnique({ where: { slug } });
  if (!title) return NextResponse.json({ ok: false, error: 'not found' }, { status: 404 });

  await db.watchProgress.upsert({
    where: { userId_titleId: { userId: user.id, titleId: title.id } },
    update: { positionSec, durationSec, episodeId },
    create: { userId: user.id, titleId: title.id, positionSec, durationSec, episodeId },
  });
  return NextResponse.json({ ok: true, data: {} });
}
