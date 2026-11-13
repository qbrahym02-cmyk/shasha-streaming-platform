'use client';

// صفحة تفاصيل العمل
import { useState } from 'react';
import Image from 'next/image';
import {
  Bell,
  Bookmark,
  BookmarkCheck,
  Clock,
  Crown,
  Link2,
  Play,
  RotateCcw,
  Star,
  Tv,
  User,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useApi, api, fmtTime } from '@/lib/api-client';
import { useApp } from '@/lib/store';
import { getDict } from '@/lib/i18n';
import type { TitleDetail } from '@/lib/types';
import { MediaCard } from './media-card';
import { nav, SectionHeader } from './ui-bits';
import { VipChip } from './ui-bits';

export function DetailsView({ slug }: { slug: string }) {
  const lang = useApp((s) => s.lang);
  const user = useApp((s) => s.user);
  const openAuth = useApp((s) => s.openAuth);
  const T = getDict(lang);
  const { data, loading } = useApi<TitleDetail>(`/api/titles/${slug}`);
  const [listOverride, setListOverride] = useState<boolean | null>(null);
  const [gateOpen, setGateOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const inList = listOverride ?? !!data?.inWatchlist;

  if (loading) {
    return (
      <div className="pt-16">
        <div className="h-[42vh] w-full shimmer md:h-[54vh]" />
        <div className="mx-auto -mt-20 max-w-5xl space-y-4 px-4 md:px-8">
          <div className="h-10 w-2/3 rounded-xl shimmer" />
          <div className="h-5 w-1/2 rounded shimmer" />
          <div className="h-20 rounded-xl shimmer" />
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="grid min-h-[70vh] place-items-center px-6 pt-24 text-center">
        <div>
          <p className="text-2xl font-black">{T.error}</p>
          <Button onClick={() => nav({ name: 'home' })} className="mt-4 rounded-xl bg-primary font-bold text-primary-foreground">
            {T.navHome}
          </Button>
        </div>
      </div>
    );
  }

  const title = lang === 'ar' ? data.titleAr : data.titleEn;
  const synopsis = lang === 'ar' ? data.synopsisAr : data.synopsisEn;
  const coming = data.releaseState === 'coming_soon';
  const gated = data.isPremium && !user?.isVip;
  const hasProgress = (data.progressPct ?? 0) > 1 && (data.progressPct ?? 0) < 95;
  const seasons = Array.from(new Set(data.episodes.map((e) => e.season)));

  const toggleList = async () => {
    if (!user) {
      openAuth('login');
      return;
    }
    try {
      if (inList) {
        await api(`/api/watchlist?slug=${slug}`, { method: 'DELETE' });
        setListOverride(false);
        toast.success(T.removedFromList);
      } else {
        await api('/api/watchlist', { method: 'POST', body: JSON.stringify({ slug }) });
        setListOverride(true);
        toast.success(T.addedToList);
      }
    } catch (e: any) {
      toast.error(e?.message || T.error);
    }
  };

  const share = async () => {
    const url = `${window.location.origin}${window.location.pathname}#/t/${slug}`;
    try {
      if (navigator.share) {
        await navigator.share({ title, url });
      } else {
        await navigator.clipboard.writeText(url);
        toast.success(T.copied);
      }
    } catch {}
  };

  const mainPlay = () => {
    if (coming) {
      toast.success(T.notified);
      return;
    }
    if (data.type === 'SERIES') {
      const target =
        data.progressEpisodeId && data.episodes.some((e) => e.id === data.progressEpisodeId)
          ? data.progressEpisodeId
          : data.episodes[0]?.id;
      const targetEp = data.episodes.find((e) => e.id === target);
      if (targetEp?.isPremium && !user?.isVip) {
        if (!user) openAuth('login');
        else setGateOpen(true);
        return;
      }
      nav({ name: 'player', slug, episodeId: target });
      return;
    }
    if (gated) {
      if (!user) openAuth('login');
      else setGateOpen(true);
      return;
    }
    nav({ name: 'player', slug });
  };

  const openEpisode = (epId: string, epPremium: boolean) => {
    if (epPremium && !user?.isVip) {
      if (!user) openAuth('login');
      else setGateOpen(true);
      return;
    }
    nav({ name: 'player', slug, episodeId: epId });
  };

  const mainLabel = coming
    ? T.notifyMe
    : hasProgress
      ? `${T.resume} ${fmtTime(data.progressPositionSec ?? 0)}`
      : T.watchNow;

  return (
    <div className="pb-8">
      {/* الخلفية */}
      <div className="relative h-[46vh] min-h-[320px] w-full md:h-[56vh]">
        <Image
          src={data.backdrop || data.poster}
          alt={title}
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-background/20" />
      </div>

      <div className="mx-auto -mt-36 max-w-[1400px] px-4 md:-mt-44 md:px-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-end">
          {/* الملصق */}
          <div className="relative hidden aspect-[2/3] w-44 shrink-0 overflow-hidden rounded-2xl ring-1 ring-white/15 shadow-2xl md:block lg:w-52">
            <Image src={data.poster} alt={title} fill sizes="208px" className="object-cover" />
          </div>

          <div className="min-w-0 flex-1 pb-2">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              {coming ? (
                <span className="rounded-full bg-secondary px-3 py-1 text-xs font-bold">{T.comingSoon}</span>
              ) : data.isPremium ? (
                <VipChip className="px-2 py-1 text-xs" />
              ) : (
                <span className="rounded-full bg-primary/15 px-3 py-1 text-xs font-bold text-primary ring-1 ring-primary/40">
                  {T.free}
                </span>
              )}
              {data.score != null && (
                <span className="flex items-center gap-1 rounded-full bg-black/50 px-2.5 py-1 text-xs font-bold text-amber-300">
                  <Star className="size-3 fill-amber-300" />
                  {data.score.toFixed(1)}
                </span>
              )}
              {data.ageRating && (
                <span className="rounded-full px-2.5 py-1 text-xs font-bold ring-1 ring-white/25">{data.ageRating}</span>
              )}
            </div>

            <h1 className="text-3xl font-black leading-tight md:text-5xl">{title}</h1>

            <p className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm font-semibold text-muted-foreground">
              <span>{data.year}</span>
              <span>·</span>
              <span>{data.type === 'MOVIE' ? T.movie : T.series}</span>
              {data.durationMin && (
                <>
                  <span>·</span>
                  <span className="flex items-center gap-1">
                    <Clock className="size-3.5" />
                    {data.durationMin} {T.minutes}
                  </span>
                </>
              )}
              {data.type === 'SERIES' && data.episodes.length > 0 && (
                <>
                  <span>·</span>
                  <span>
                    {data.episodes.length} {T.episodesCount}
                  </span>
                </>
              )}
            </p>

            <div className="mt-2.5 flex flex-wrap gap-1.5">
              {data.genres.map((g) => (
                <button
                  key={g.slug}
                  onClick={() => nav({ name: 'browse', genre: g.slug })}
                  className="rounded-full bg-secondary px-2.5 py-1 text-xs font-bold text-secondary-foreground transition hover:bg-primary hover:text-primary-foreground"
                >
                  {lang === 'ar' ? g.nameAr : g.nameEn}
                </button>
              ))}
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-2.5">
              <Button
                size="lg"
                onClick={mainPlay}
                className={`h-12 rounded-xl px-7 text-base font-extrabold ${
                  coming
                    ? 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                    : gated
                      ? 'bg-vip text-vip-foreground hover:bg-vip/90'
                      : 'glow-play bg-primary text-primary-foreground hover:bg-primary/90'
                }`}
              >
                {coming ? (
                  <Bell className="size-5" />
                ) : hasProgress ? (
                  <RotateCcw className="size-5" />
                ) : gated ? (
                  <Crown className="size-5" />
                ) : (
                  <Play className="size-5 fill-current" />
                )}
                {gated && !coming && !user ? T.watchNow : mainLabel}
              </Button>

              <Button
                size="lg"
                variant="secondary"
                onClick={toggleList}
                className="h-12 rounded-xl px-5 font-bold"
              >
                {inList ? <BookmarkCheck className="size-5 text-primary" /> : <Bookmark className="size-5" />}
                <span className="hidden sm:inline">{inList ? T.inList : T.addToList}</span>
              </Button>

              <Button size="lg" variant="ghost" onClick={share} className="h-12 rounded-xl px-4" aria-label="share">
                <Link2 className="size-5" />
              </Button>
            </div>

            {gated && !coming && user && (
              <button
                onClick={() => nav({ name: 'plans' })}
                className="mt-4 flex w-full items-center gap-3 rounded-2xl bg-vip/10 p-4 text-start ring-1 ring-vip/40 transition hover:bg-vip/15"
              >
                <Crown className="size-8 shrink-0 text-vip" />
                <span>
                  <span className="gold-text block text-sm font-black">{T.vipLockTitle}</span>
                  <span className="block text-xs text-muted-foreground">{T.vipLockDesc}</span>
                </span>
              </button>
            )}
          </div>
        </div>

        {/* القصة */}
        {synopsis && (
          <section className="mt-8 max-w-4xl">
            <h2 className="mb-2 text-lg font-extrabold">{T.story}</h2>
            <p
              className={`whitespace-pre-line text-sm leading-7 text-foreground/80 ${expanded ? '' : 'line-clamp-3'}`}
            >
              {synopsis}
            </p>
            <button
              onClick={() => setExpanded((v) => !v)}
              className="mt-1 text-sm font-bold text-primary hover:text-primary/80"
            >
              {expanded ? '−' : '+'}
            </button>
          </section>
        )}

        {/* الحلقات */}
        {data.type === 'SERIES' && data.episodes.length > 0 && (
          <section className="mt-10">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-extrabold">
              <Tv className="size-5 text-primary" />
              {T.episodes} {seasons.length > 1 ? `— ${T.seasonWord} 1` : ''}
            </h2>
            <div className="grid gap-2 lg:grid-cols-2">
              {data.episodes.map((ep) => {
                const watched = data.progressEpisodeId === ep.id && (data.progressPct ?? 0) >= 1;
                const locked = ep.isPremium && !user?.isVip;
                return (
                  <button
                    key={ep.id}
                    onClick={() => openEpisode(ep.id, ep.isPremium)}
                    className={`group flex items-center gap-3.5 rounded-2xl p-3 text-start ring-1 transition ${
                      locked
                        ? 'bg-vip/5 ring-vip/30 hover:bg-vip/10'
                        : 'bg-card ring-white/5 hover:bg-white/5 hover:ring-primary/40'
                    }`}
                  >
                    <span
                      className={`relative grid size-12 shrink-0 place-items-center rounded-xl text-base font-black ${
                        locked ? 'bg-vip/15 text-vip' : 'bg-secondary text-primary'
                      }`}
                    >
                      {locked ? <Crown className="size-5" /> : ep.number}
                      {!locked && watched && (data.progressPct ?? 0) > 1 && (data.progressPct ?? 0) < 95 && (
                        <span className="absolute bottom-1 inset-x-1.5 h-0.5 rounded bg-white/20">
                          <span className="block h-full rounded bg-primary" style={{ width: `${data.progressPct}%` }} />
                        </span>
                      )}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-2">
                        <span className="truncate text-sm font-bold">
                          {lang === 'ar' ? ep.nameAr : ep.nameEn}
                        </span>
                        {ep.isPremium && <VipChip />}
                      </span>
                      <span className="mt-0.5 block text-xs text-muted-foreground">
                        {T.episode} {ep.number}
                        {ep.durationMin ? ` · ${ep.durationMin} ${T.minutes}` : ''}
                      </span>
                    </span>
                    <Play
                      className={`size-5 shrink-0 transition ${
                        locked ? 'text-vip' : 'text-muted-foreground group-hover:text-primary'
                      }`}
                    />
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {/* مشابهة */}
        {data.similar.length > 0 && (
          <section className="mt-10">
            <SectionHeader title={T.similar} />
            <div className="no-scrollbar flex gap-3 overflow-x-auto px-4 pb-2 md:gap-4 md:px-8">
              {data.similar.map((s) => (
                <MediaCard key={s.id} item={s} />
              ))}
            </div>
          </section>
        )}
      </div>

      {/* بوابة VIP */}
      <Dialog open={gateOpen} onOpenChange={setGateOpen}>
        <DialogContent className="max-w-sm text-center">
          <DialogHeader>
            <div className="mx-auto mb-2 grid size-20 place-items-center rounded-full bg-vip/15 ring-2 ring-vip/40">
              <Crown className="size-10 text-vip" />
            </div>
            <DialogTitle className="text-center">{T.vipLockTitle}</DialogTitle>
            <DialogDescription className="text-center">{T.vipLockDesc}</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-2">
            <Button
              onClick={() => {
                setGateOpen(false);
                nav({ name: 'plans' });
              }}
              className="h-12 rounded-xl bg-vip text-base font-black text-vip-foreground hover:bg-vip/90"
            >
              <Crown className="size-5" />
              {T.vipCta}
            </Button>
            {!user && (
              <Button
                variant="outline"
                onClick={() => {
                  setGateOpen(false);
                  openAuth('login');
                }}
                className="rounded-xl font-bold"
              >
                <User className="size-4" />
                {T.login}
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
