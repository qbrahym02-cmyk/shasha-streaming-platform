'use client';

// بطاقة عمل (فيلم/مسلسل)
import Image from 'next/image';
import { Play } from 'lucide-react';
import { useApp } from '@/lib/store';
import { getDict } from '@/lib/i18n';
import type { TitleCard } from '@/lib/types';
import { nav } from './ui-bits';
import { VipChip } from './ui-bits';

export function MediaCard({
  item,
  priority = false,
  className = 'w-[132px] sm:w-[150px] md:w-[168px]',
}: {
  item: TitleCard;
  priority?: boolean;
  className?: string;
}) {
  const lang = useApp((s) => s.lang);
  const T = getDict(lang);
  const title = lang === 'ar' ? item.titleAr : item.titleEn;
  const coming = item.releaseState === 'coming_soon';

  return (
    <div
      className={`group shrink-0 cursor-pointer snap-start ${className}`}
      onClick={() => nav({ name: 'details', slug: item.slug })}
      role="link"
      aria-label={title}
    >
      <div className="relative aspect-[2/3] overflow-hidden rounded-xl shadow-lg ring-1 ring-white/10 transition-all duration-300 group-hover:scale-[1.04] group-hover:ring-primary/70 group-hover:shadow-primary/20">
        <Image
          src={item.poster}
          alt={title}
          fill
          sizes="(max-width:640px) 45vw, (max-width:1024px) 30vw, 180px"
          className="object-cover"
          priority={priority}
        />

        {/* شارة VIP */}
        {item.isPremium && (
          <div className="absolute top-2 start-2">
            <VipChip />
          </div>
        )}

        {/* قريباً */}
        {coming && (
          <div className="absolute bottom-0 inset-x-0 bg-black/65 py-1 text-center text-[11px] font-bold text-white/90 backdrop-blur-sm">
            {T.comingSoon}
          </div>
        )}

        {/* شريط التقدم */}
        {item.progressPct != null && item.progressPct > 0 && (
          <div className="absolute bottom-0 inset-x-0 h-1 bg-white/25">
            <div className="h-full bg-primary" style={{ width: `${item.progressPct}%` }} />
          </div>
        )}

        {/* زر تشغيل عند التحويم */}
        <div className="absolute inset-0 grid place-items-center bg-black/35 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <span className="grid size-12 place-items-center rounded-full bg-primary text-primary-foreground shadow-xl shadow-primary/40">
            <Play className="size-6 fill-current" />
          </span>
        </div>
      </div>

      <div className="pt-2">
        <p className="truncate text-sm font-bold">{title}</p>
        <p className="mt-0.5 truncate text-xs text-muted-foreground">
          {item.year} · {item.type === 'MOVIE' ? T.movie : T.series}
          {item.score ? ` · ${item.score.toFixed(1)}` : ''}
        </p>
      </div>
    </div>
  );
}

export function MediaGrid({ items, loading }: { items?: TitleCard[] | null; loading?: boolean }) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-3 px-4 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 md:px-8 lg:grid-cols-5 xl:grid-cols-6">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="w-full">
            <div className="aspect-[2/3] w-full rounded-xl shimmer" />
            <div className="mt-2 h-4 w-3/4 rounded shimmer" />
          </div>
        ))}
      </div>
    );
  }
  return (
    <div className="grid grid-cols-2 gap-3 px-4 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 md:px-8 lg:grid-cols-5 xl:grid-cols-6">
      {(items || []).map((it, i) => (
        <MediaCard key={it.id} item={it} priority={i < 6} className="w-full" />
      ))}
    </div>
  );
}
