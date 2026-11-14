'use client';

// صفحة التصفح مع الفلاتر
import { useMemo, useState } from 'react';
import { Crown, LayoutGrid } from 'lucide-react';
import { useApi } from '@/lib/api-client';
import { useApp } from '@/lib/store';
import { getDict } from '@/lib/i18n';
import type { GenreInfo, TitleCard } from '@/lib/types';
import { MediaGrid } from './media-card';
import { EmptyState } from './ui-bits';

export function BrowseView({
  initialType,
  initialGenre,
  initialVip,
}: {
  initialType?: string;
  initialGenre?: string;
  initialVip?: boolean;
}) {
  const lang = useApp((s) => s.lang);
  const T = getDict(lang);
  const [type, setType] = useState<string>(initialType || '');
  const [genre, setGenre] = useState<string>(initialGenre || '');
  const [vipOnly, setVipOnly] = useState<boolean>(!!initialVip);
  const [freeOnly, setFreeOnly] = useState(false);
  const [sort, setSort] = useState<'popular' | 'rated' | 'newest'>('popular');

  const { data: genres } = useApi<GenreInfo[]>('/api/genres');

  const url = useMemo(() => {
    const p = new URLSearchParams();
    if (type) p.set('type', type);
    if (genre) p.set('genre', genre);
    if (vipOnly) p.set('section', 'vip');
    p.set('sort', sort);
    p.set('limit', '60');
    return `/api/titles?${p.toString()}`;
  }, [type, genre, vipOnly, sort]);

  const { data: items, loading } = useApi<TitleCard[]>(url);
  const filtered = useMemo(() => {
    let list = items ?? [];
    if (freeOnly) list = list.filter((t) => !t.isPremium);
    return list;
  }, [items, freeOnly]);

  const chip = (active: boolean) =>
    `shrink-0 rounded-full px-4 py-1.5 text-sm font-bold transition-all ${
      active
        ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25'
        : 'bg-secondary text-secondary-foreground hover:bg-secondary/70'
    }`;

  return (
    <div className="pt-24 md:pt-28">
      <div className="mb-6 px-4 md:px-8">
        <h1 className="flex items-center gap-2 text-2xl font-black md:text-3xl">
          <LayoutGrid className="size-7 text-primary" />
          {T.browse}
        </h1>
      </div>

      {/* فلاتر */}
      <div className="no-scrollbar mb-3 flex gap-2 overflow-x-auto px-4 md:px-8">
        <button className={chip(type === '')} onClick={() => setType('')}>
          {T.all}
        </button>
        <button className={chip(type === 'MOVIE')} onClick={() => setType(type === 'MOVIE' ? '' : 'MOVIE')}>
          {T.movie}
        </button>
        <button className={chip(type === 'SERIES')} onClick={() => setType(type === 'SERIES' ? '' : 'SERIES')}>
          {T.series}
        </button>
        <span className="mx-1 my-auto h-6 w-px shrink-0 bg-white/10" />
        <button
          className={`${chip(vipOnly)} ${vipOnly ? 'bg-vip text-vip-foreground shadow-vip/25' : ''}`}
          onClick={() => {
            setVipOnly((v) => !v);
            if (!vipOnly) setFreeOnly(false);
          }}
        >
          <span className="flex items-center gap-1">
            <Crown className="size-3.5" />
            {T.vipOnly}
          </span>
        </button>
        <button className={chip(freeOnly)} onClick={() => setFreeOnly((v) => !v)}>
          {T.freeOnly}
        </button>
      </div>

      <div className="no-scrollbar mb-3 flex gap-2 overflow-x-auto px-4 md:px-8">
        <button className={chip(genre === '')} onClick={() => setGenre('')}>
          {T.all}
        </button>
        {(genres ?? []).map((g) => (
          <button
            key={g.slug}
            className={chip(genre === g.slug)}
            onClick={() => setGenre(genre === g.slug ? '' : g.slug)}
          >
            {lang === 'ar' ? g.nameAr : g.nameEn}
          </button>
        ))}
      </div>

      <div className="no-scrollbar mb-8 flex gap-2 overflow-x-auto px-4 md:px-8">
        <span className="my-auto me-1 shrink-0 text-xs font-bold text-muted-foreground">{T.sort}:</span>
        {(
          [
            ['popular', T.sortPopular],
            ['rated', T.sortTopRated],
            ['newest', T.sortNewest],
          ] as const
        ).map(([k, label]) => (
          <button key={k} className={chip(sort === k)} onClick={() => setSort(k)}>
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <MediaGrid loading />
      ) : filtered.length === 0 ? (
        <EmptyState title={T.noResults} hint={T.noResultsHint} />
      ) : (
        <MediaGrid items={filtered} />
      )}
    </div>
  );
}
