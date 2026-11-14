// أدوات الكتالوج (الخادم) — تحويل بيانات Prisma إلى استجابات API
import { db } from './db';
import { isVip } from './auth';

export async function mapTitle(t: any, userId?: string | null): Promise<any> {
  let inWatchlist = false;
  let progress: any = null;
  if (userId && t.id) {
    const [wl, pg] = await Promise.all([
      db.watchlistItem.findUnique({ where: { userId_titleId: { userId, titleId: t.id } } }),
      db.watchProgress.findUnique({ where: { userId_titleId: { userId, titleId: t.id } } }),
    ]);
    inWatchlist = !!wl;
    progress = pg;
  }
  return {
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
    featured: t.featured,
    genres: (t.genres || []).map((g: any) => ({ slug: g.genre.slug, nameAr: g.genre.nameAr, nameEn: g.genre.nameEn })),
    inWatchlist,
    progressPct: progress && progress.durationSec > 0 ? Math.min(100, (progress.positionSec / progress.durationSec) * 100) : 0,
    progressPositionSec: progress?.positionSec ?? 0,
    progressDurationSec: progress?.durationSec ?? 0,
    progressEpisodeId: progress?.episodeId ?? null,
  };
}

export async function userFlagsForTitles(titles: any[], userId: string | null) {
  if (!userId || titles.length === 0) return titles.map((t) => ({ ...t, inWatchlist: false, progressPct: 0 }));
  const ids = titles.map((t) => t.id);
  const [wlItems, pgItems] = await Promise.all([
    db.watchlistItem.findMany({ where: { userId, titleId: { in: ids } } }),
    db.watchProgress.findMany({ where: { userId, titleId: { in: ids } } }),
  ]);
  const wlSet = new Set(wlItems.map((w) => w.titleId));
  const pgMap = new Map(pgItems.map((p) => [p.titleId, p]));
  return titles.map((t) => {
    const pg = pgMap.get(t.id);
    return {
      ...t,
      inWatchlist: wlSet.has(t.id),
      progressPct: pg && pg.durationSec > 0 ? Math.min(100, (pg.positionSec / pg.durationSec) * 100) : 0,
      progressPositionSec: pg?.positionSec ?? 0,
      progressDurationSec: pg?.durationSec ?? 0,
      progressEpisodeId: pg?.episodeId ?? null,
    };
  });
}

export { isVip };
