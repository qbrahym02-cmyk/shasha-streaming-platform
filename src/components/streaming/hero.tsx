'use client';

// البطل (الواجهة الرئيسية المتحركة)
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { AnimatePresence, motion } from 'framer-motion';
import { Bell, ChevronLeft, ChevronRight, Info, Play, Star } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { useApp } from '@/lib/store';
import { getDict } from '@/lib/i18n';
import type { TitleCard } from '@/lib/types';
import { nav } from './ui-bits';
import { VipChip } from './ui-bits';

export function Hero({ items }: { items: TitleCard[] }) {
  const lang = useApp((s) => s.lang);
  const user = useApp((s) => s.user);
  const openAuth = useApp((s) => s.openAuth);
  const T = getDict(lang);
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused || items.length < 2) return;
    const t = setInterval(() => setI((p) => (p + 1) % items.length), 6500);
    return () => clearInterval(t);
  }, [paused, items.length]);

  if (items.length === 0) {
    return <div className="h-[62vh] min-h-[420px] w-full shimmer" />;
  }

  const item = items[Math.min(i, items.length - 1)];
  const title = lang === 'ar' ? item.titleAr : item.titleEn;
  const synopsis = lang === 'ar' ? item.synopsisAr : item.synopsisEn;
  const coming = item.releaseState === 'coming_soon';
  const gated = item.isPremium && !user?.isVip;
  const genreText = item.genres.slice(0, 2).map((g) => (lang === 'ar' ? g.nameAr : g.nameEn)).join('، ');

  const primaryCta = () => {
    if (coming) {
      toast.success(T.notified);
      return;
    }
    if (item.type === 'SERIES') {
      nav({ name: 'details', slug: item.slug });
      return;
    }
    if (gated) {
      if (!user) openAuth('login');
      else nav({ name: 'plans' });
      return;
    }
    nav({ name: 'player', slug: item.slug });
  };

  return (
    <section
      className="relative h-[72vh] min-h-[500px] max-h-[780px] w-full overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-label="featured"
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={item.id}
          initial={{ opacity: 0, scale: 1.03 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="absolute inset-0"
        >
          <Image
            src={item.backdrop || item.poster}
            alt={title}
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        </motion.div>
      </AnimatePresence>

      {/* تدرجات */}
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/55 to-background/10" />
      <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-transparent to-transparent" />

      {/* المحتوى */}
      <div className="absolute inset-x-0 bottom-0 p-5 pb-7 md:p-12 md:pb-14">
        <div className="max-w-3xl">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            {coming ? (
              <span className="rounded-full bg-secondary px-3 py-1 text-xs font-bold text-secondary-foreground">
                {T.comingSoon}
              </span>
            ) : item.isPremium ? (
              <VipChip className="px-2 py-1 text-xs" />
            ) : (
              <span className="rounded-full bg-primary/15 px-3 py-1 text-xs font-bold text-primary ring-1 ring-primary/40">
                {T.free}
              </span>
            )}
            {item.score != null && (
              <span className="flex items-center gap-1 rounded-full bg-black/50 px-2.5 py-1 text-xs font-bold text-amber-300 backdrop-blur-sm">
                <Star className="size-3 fill-amber-300" />
                {item.score.toFixed(1)}
              </span>
            )}
            {item.ageRating && (
              <span className="rounded-full bg-black/50 px-2.5 py-1 text-xs font-bold text-white/85 ring-1 ring-white/20 backdrop-blur-sm">
                {item.ageRating}
              </span>
            )}
          </div>

          <h1 className="text-4xl font-black leading-tight drop-shadow-lg md:text-6xl">{title}</h1>

          <p className="mt-2 text-sm font-semibold text-muted-foreground md:text-base">
            {item.year}
            {genreText ? ` · ${genreText}` : ''}
            {item.durationMin ? ` · ${item.durationMin} ${T.minutes}` : ''}
          </p>

          {synopsis && (
            <p className="mt-3 hidden max-w-2xl text-sm leading-relaxed text-foreground/80 md:line-clamp-3 md:block">
              {synopsis}
            </p>
          )}

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <Button
              size="lg"
              onClick={primaryCta}
              className="glow-play h-12 rounded-xl bg-primary px-7 text-base font-extrabold text-primary-foreground hover:bg-primary/90"
            >
              {coming ? (
                <>
                  <Bell className="size-5" />
                  {T.notifyMe}
                </>
              ) : gated ? (
                <>
                  <Play className="size-5 fill-current" />
                  {user ? T.vipCta : T.watchNow}
                </>
              ) : (
                <>
                  <Play className="size-5 fill-current" />
                  {T.watchNow}
                </>
              )}
            </Button>
            <Button
              size="lg"
              variant="secondary"
              onClick={() => nav({ name: 'details', slug: item.slug })}
              className="h-12 rounded-xl glass px-6 text-base font-bold hover:bg-white/10"
            >
              <Info className="size-5" />
              {T.moreInfo}
            </Button>
          </div>
        </div>
      </div>

      {/* نقاط التنقل */}
      {items.length > 1 && (
        <div className="absolute bottom-5 end-5 z-10 flex items-center gap-2 md:bottom-8 md:end-12">
          <button
            aria-label="previous"
            onClick={() => setI((p) => (p - 1 + items.length) % items.length)}
            className="grid size-9 place-items-center rounded-full bg-black/45 ring-1 ring-white/20 backdrop-blur-sm transition hover:bg-black/70"
          >
            <ChevronRight className="size-5 rtl:rotate-180" />
          </button>
          {items.map((_, k) => (
            <button
              key={k}
              aria-label={`slide-${k + 1}`}
              onClick={() => setI(k)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                k === i ? 'w-7 bg-primary' : 'w-3 bg-white/30 hover:bg-white/50'
              }`}
            />
          ))}
          <button
            aria-label="next"
            onClick={() => setI((p) => (p + 1) % items.length)}
            className="grid size-9 place-items-center rounded-full bg-black/45 ring-1 ring-white/20 backdrop-blur-sm transition hover:bg-black/70"
          >
            <ChevronLeft className="size-5 rtl:rotate-180" />
          </button>
        </div>
      )}
    </section>
  );
}
