import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getRequestUser } from '@/lib/auth';
import { userFlagsForTitles } from '@/lib/catalog';

// GET /api/watchlist — قائمة المستخدم
export async function GET(req: NextRequest) {
  const user = await getRequestUser(req);
  if (!user) return NextResponse.json({ ok: true, data: [] });

  const items = await db.watchlistItem.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
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
  }));

  const withFlags = await userFlagsForTitles(mapped, user.id);
  return NextResponse.json({ ok: true, data: withFlags });
}

// POST /api/watchlist {slug} — إضافة
export async function POST(req: NextRequest) {
  const user = await getRequestUser(req);
  if (!user) return NextResponse.json({ ok: false, error: 'سجّل الدخول أولاً', code: 'auth_required' }, { status: 401 });

  const body = await req.json().catch(() => null);
  const slug = String(body?.slug || '');
  const title = await db.title.findUnique({ where: { slug } });
  if (!title) return NextResponse.json({ ok: false, error: 'العمل غير موجود' }, { status: 404 });

  await db.watchlistItem.upsert({
    where: { userId_titleId: { userId: user.id, titleId: title.id } },
    update: {},
    create: { userId: user.id, titleId: title.id },
  });
  return NextResponse.json({ ok: true, data: { inWatchlist: true } });
}

// DELETE /api/watchlist?slug= — إزالة
export async function DELETE(req: NextRequest) {
  const user = await getRequestUser(req);
  if (!user) return NextResponse.json({ ok: false, error: 'سجّل الدخول أولاً' }, { status: 401 });

  const slug = req.nextUrl.searchParams.get('slug') || '';
  const title = await db.title.findUnique({ where: { slug } });
  if (!title) return NextResponse.json({ ok: false, error: 'العمل غير موجود' }, { status: 404 });

  await db.watchlistItem.deleteMany({ where: { userId: user.id, titleId: title.id } });
  return NextResponse.json({ ok: true, data: { inWatchlist: false } });
}
