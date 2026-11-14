'use client';

// صف أفقي من البطاقات
import { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { TitleCard } from '@/lib/types';
import { useApp } from '@/lib/store';
import { getDict } from '@/lib/i18n';
import { MediaCard } from './media-card';
import { CardSkeleton } from './ui-bits';

export function Row({
  title,
  icon,
  items,
  loading,
  onSeeAll,
}: {
  title: string;
  icon?: React.ReactNode;
  items?: TitleCard[] | null;
  loading?: boolean;
  onSeeAll?: () => void;
}) {
  const lang = useApp((s) => s.lang);
  const T = getDict(lang);
  const scroller = useRef<HTMLDivElement>(null);

  const scroll = (dir: 1 | -1) => {
    const el = scroller.current;
    if (!el) return;
    const isRtl = document.documentElement.dir === 'rtl';
    const amount = el.clientWidth * 0.8;
    el.scrollBy({ left: dir * amount * (isRtl ? -1 : 1), behavior: 'smooth' });
  };

  if (!loading && (!items || items.length === 0)) return null;

  return (
    <section className="group/row relative py-3">
      <div className="mb-2 flex items-center justify-between px-4 md:px-8">
        <h2 className="flex items-center gap-2 text-lg font-extrabold md:text-xl">
          {icon}
          {title}
        </h2>
        {onSeeAll && (
          <button
            onClick={onSeeAll}
            className="flex items-center gap-0.5 text-sm font-semibold text-primary transition-colors hover:text-primary/80"
          >
            {T.seeAll}
            <ChevronLeft className="size-4 rtl:rotate-180" />
          </button>
        )}
      </div>

      <div className="relative">
        <div
          ref={scroller}
          className="no-scrollbar flex snap-x gap-3 overflow-x-auto px-4 pb-2 md:gap-4 md:px-8"
        >
          {loading
            ? Array.from({ length: 7 }).map((_, i) => <CardSkeleton key={i} />)
            : items!.map((it, i) => <MediaCard key={it.id} item={it} priority={i < 4} />)}
        </div>

        {/* أسهم على الشاشات الكبيرة */}
        <button
          aria-label="scroll-previous"
          onClick={() => scroll(-1)}
          className="absolute start-0 top-1/2 z-10 hidden -translate-y-1/2 rounded-full bg-background/85 p-2.5 text-foreground shadow-xl ring-1 ring-white/10 opacity-0 transition-opacity group-hover/row:opacity-100 md:block"
        >
          <ChevronRight className="size-5 rtl:rotate-180" />
        </button>
        <button
          aria-label="scroll-next"
          onClick={() => scroll(1)}
          className="absolute end-0 top-1/2 z-10 hidden -translate-y-1/2 rounded-full bg-background/85 p-2.5 text-foreground shadow-xl ring-1 ring-white/10 opacity-0 transition-opacity group-hover/row:opacity-100 md:block"
        >
          <ChevronLeft className="size-5 rtl:rotate-180" />
        </button>
      </div>
    </section>
  );
}
