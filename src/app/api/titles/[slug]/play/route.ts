import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getRequestUser, isVip } from '@/lib/auth';

// GET /api/titles/[slug]/play?e=episodeId
// التحقق من الصلاحية قبل كشف رابط الفيديو (مجاني / VIP)
export async function GET(req: NextRequest, ctx: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await ctx.params;
    const episodeId = req.nextUrl.searchParams.get('e');

    const title = await db.title.findUnique({
      where: { slug },
      include: { episodes: { orderBy: [{ season: 'asc' }, { number: 'asc' }] } },
    });
    if (!title) {
      return NextResponse.json({ ok: false, error: 'العمل غير موجود', code: 'not_found' }, { status: 404 });
    }
    if (title.releaseState === 'coming_soon') {
      return NextResponse.json({ ok: false, error: 'هذا العمل لم يتوفر بعد', code: 'not_available' }, { status: 403 });
    }

    const user = await getRequestUser(req);
    // الحلقة المحددة، أو الأولى تلقائياً عند الدخول المباشر للمسلسل
    const episode = episodeId ? title.episodes.find((e) => e.id === episodeId) : title.episodes[0] || null;

    // مصدر التشغيل: الحلقة المحددة أو الفيلم نفسه
    let source: { sourceType: string | null; sourceUrl: string | null; fallbackUrl: string | null; isPremium: boolean };
    if (title.type === 'SERIES') {
      if (!episode) {
        return NextResponse.json({ ok: false, error: 'الحلقة غير موجودة', code: 'no_episode' }, { status: 400 });
      }
      source = episode;
    } else {
      source = title as any;
    }

    if (!source.sourceUrl) {
      return NextResponse.json({ ok: false, error: 'لا يوجد مصدر تشغيل', code: 'no_source' }, { status: 404 });
    }

    if (source.isPremium) {
      if (!user) {
        return NextResponse.json({ ok: false, error: 'سجّل الدخول أولاً', code: 'auth_required' }, { status: 401 });
      }
      if (!isVip(user)) {
        return NextResponse.json({ ok: false, error: 'هذا المحتوى متاح لمشتركي VIP', code: 'vip_required' }, { status: 403 });
      }
    }

    // استئناف من آخر موضع
    let resumeAt = 0;
    if (user) {
      const progress = await db.watchProgress.findUnique({
        where: { userId_titleId: { userId: user.id, titleId: title.id } },
      });
      if (progress && progress.episodeId === (episode?.id ?? null) && progress.positionSec > 5) {
        const pct = progress.durationSec > 0 ? progress.positionSec / progress.durationSec : 0;
        if (pct < 0.95) resumeAt = progress.positionSec;
      }
    }

    const episodes = title.episodes.map((e: any) => ({
      id: e.id,
      season: e.season,
      number: e.number,
      nameAr: e.nameAr,
      nameEn: e.nameEn,
      durationMin: e.durationMin,
      isPremium: e.isPremium,
    }));
    const idx = episode ? episodes.findIndex((e: any) => e.id === episode.id) : -1;
    const nextEpisodeId = idx >= 0 && idx < episodes.length - 1 ? episodes[idx + 1].id : null;

    return NextResponse.json({
      ok: true,
      data: {
        sourceType: source.sourceType,
        sourceUrl: source.sourceUrl,
        fallbackUrl: source.fallbackUrl,
        titleSlug: title.slug,
        titleAr: title.titleAr,
        titleEn: title.titleEn,
        episodeId: episode?.id ?? null,
        episodeNameAr: episode?.nameAr ?? null,
        episodeNameEn: episode?.nameEn ?? null,
        episodes,
        nextEpisodeId,
        resumeAt,
      },
    });
  } catch (e) {
    console.error('play error', e);
    return NextResponse.json({ ok: false, error: 'حدث خطأ ما' }, { status: 500 });
  }
}
