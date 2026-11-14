'use client';

// عناصر واجهة مشتركة لمنصة شاشة
import { useEffect, useState } from 'react';
import { useApp, viewToHash } from '@/lib/store';
import { getDict } from '@/lib/i18n';
import { api } from '@/lib/api-client';
import type { View } from '@/lib/types';
import { BRAND } from '@/lib/config';
import { Bookmark, Crown, Film, Home, LayoutGrid, Search, Star, User } from 'lucide-react';

// ===== التنقل =====
export function nav(v: View) {
  const target = viewToHash(v);
  if (window.location.hash === target) {
    useApp.getState().setView(v);
  } else {
    window.location.hash = target;
  }
}

// ===== الشعار =====
export function LogoMark({ size = 36 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" aria-hidden="true" className="shrink-0">
      <rect x="2" y="2" width="44" height="44" rx="12" fill="url(#shashaG)" />
      <path d="M19 15.5v17c0 1.6 1.75 2.56 3.1 1.7l13.2-8.5c1.25-.8 1.25-2.6 0-3.4l-13.2-8.5c-1.35-.86-3.1.1-3.1 1.7Z" fill="#070b09" />
      <path d="M33 10.5c.5 3.8 2.6 6 6.5 6.5-3.9.5-6 2.7-6.5 6.5-.5-3.8-2.6-6-6.5-6.5 3.9-.5 6-2.7 6.5-6.5Z" fill="#e8b923" />
      <defs>
        <linearGradient id="shashaG" x1="2" y1="2" x2="46" y2="46" gradientUnits="userSpaceOnUse">
          <stop stopColor="#00e07a" />
          <stop offset="1" stopColor="#00a352" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function BrandLogo() {
  const lang = useApp((s) => s.lang);
  return (
    <button
      onClick={() => nav({ name: 'home' })}
      className="flex items-center gap-2.5 group"
      aria-label="SHASHA home"
    >
      <LogoMark size={38} />
      <span className="flex flex-col items-start leading-none">
        <span className="text-2xl font-black tracking-tight group-hover:text-primary transition-colors">
          {lang === 'ar' ? BRAND.nameAr : BRAND.nameEn}
        </span>
        <span className="text-[10px] font-bold tracking-[0.35em] text-muted-foreground -mt-0.5">
          SHASHA
        </span>
      </span>
    </button>
  );
}

// ===== شرائح =====
export function VipChip({ className = '' }: { className?: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md bg-vip px-1.5 py-0.5 text-[10px] font-black text-vip-foreground ${className}`}
    >
      <Crown className="size-3" strokeWidth={2.5} />
      VIP
    </span>
  );
}

export function ComingSoonChip({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-md bg-black/60 glass px-2 py-0.5 text-[10px] font-bold text-white/90 backdrop-blur-sm">
      {label}
    </span>
  );
}

export function ScoreChip({ score }: { score: number | null }) {
  if (!score) return null;
  return (
    <span className="inline-flex items-center gap-1 rounded-md bg-black/60 px-1.5 py-0.5 text-[11px] font-bold text-amber-300 backdrop-blur-sm">
      <Star className="size-3 fill-amber-300" />
      {score.toFixed(1)}
    </span>
  );
}

// ===== حالات فارغة وتحميل =====
export function EmptyState({
  icon,
  title,
  hint,
  action,
}: {
  icon?: React.ReactNode;
  title: string;
  hint?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-20 px-6 text-center">
      <div className="grid size-20 place-items-center rounded-full bg-secondary text-muted-foreground">
        {icon ?? <Film className="size-9" />}
      </div>
      <p className="text-lg font-bold">{title}</p>
      {hint && <p className="max-w-sm text-sm text-muted-foreground">{hint}</p>}
      {action}
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="w-[132px] sm:w-[150px] md:w-[168px] shrink-0">
      <div className="aspect-[2/3] w-full rounded-xl shimmer" />
      <div className="mt-2 h-3.5 w-3/4 rounded shimmer" />
      <div className="mt-1.5 h-3 w-1/2 rounded shimmer" />
    </div>
  );
}

export function RowSkeleton({ cards = 7 }: { cards?: number }) {
  return (
    <div className="py-3">
      <div className="mb-3 px-4 md:px-8 h-6 w-40 rounded shimmer" />
      <div className="flex gap-3 md:gap-4 overflow-hidden px-4 md:px-8">
        {Array.from({ length: cards }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

export function HeroSkeleton() {
  return <div className="h-[68vh] min-h-[460px] w-full shimmer" />;
}

// ===== عنوان قسم =====
export function SectionHeader({
  title,
  icon,
  onSeeAll,
}: {
  title: string;
  icon?: React.ReactNode;
  onSeeAll?: () => void;
}) {
  const lang = useApp((s) => s.lang);
  const T = getDict(lang);
  return (
    <div className="mb-2 flex items-center justify-between px-4 md:px-8">
      <h2 className="flex items-center gap-2 text-lg font-extrabold md:text-xl">
        {icon}
        {title}
      </h2>
      {onSeeAll && (
        <button
          onClick={onSeeAll}
          className="text-sm font-semibold text-primary hover:text-primary/80 transition-colors"
        >
          {T.seeAll}
        </button>
      )}
    </div>
  );
}

// ===== شارة عدد القائمة =====
export function useWatchlistCount() {
  const user = useApp((s) => s.user);
  const [count, setCount] = useState(0);
  const userId = user?.id ?? null;
  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    api<any[]>('/api/watchlist')
      .then((list) => {
        if (!cancelled && Array.isArray(list)) setCount(list.length);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [userId]);
  return userId ? count : 0;
}

// عناصر التبويب السفلي
export const TAB_ICONS = { Home, Browse: LayoutGrid, Search, List: Bookmark, Account: User };
