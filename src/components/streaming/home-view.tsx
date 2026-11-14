'use client';

// الصفحة الرئيسية
import { Flame, Crown, Film, Sparkles, Tv, Clock, Ghost } from 'lucide-react';
import { useApi } from '@/lib/api-client';
import { useApp } from '@/lib/store';
import { getDict } from '@/lib/i18n';
import type { TitleCard } from '@/lib/types';
import { Hero } from './hero';
import { Row } from './row';
import { RowSkeleton, HeroSkeleton } from './ui-bits';
import { nav } from './ui-bits';

export function HomeView() {
  const lang = useApp((s) => s.lang);
  const user = useApp((s) => s.user);
  const T = getDict(lang);

  const { data: all, loading } = useApi<TitleCard[]>('/api/titles?limit=60');
  const { data: contData } = useApi<{ list: TitleCard[] }>(user ? '/api/progress' : null);

  const items = all ?? [];
  const featured = items.filter((t) => t.featured && t.backdrop).slice(0, 5);
  const trending = items
    .filter((t) => t.trending != null)
    .sort((a, b) => (a.trending ?? 0) - (b.trending ?? 0))
    .slice(0, 12);
  const vip = items.filter((t) => t.isPremium).slice(0, 12);
  const movies = items.filter((t) => t.type === 'MOVIE').slice(0, 12);
  const series = items.filter((t) => t.type === 'SERIES').slice(0, 12);
  const anime = items.filter((t) => t.genres.some((g) => g.slug === 'anime')).slice(0, 12);
  const newest = [...items].sort((a, b) => (b.year ?? 0) - (a.year ?? 0)).slice(0, 12);
  const continueList = (contData?.list ?? []).filter(
    (t) => t.progressPct != null && t.progressPct > 1 && t.progressPct < 95
  );

  if (loading) {
    return (
      <div>
        <HeroSkeleton />
        <div className="mt-6 space-y-2">
          <RowSkeleton />
          <RowSkeleton />
          <RowSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div>
      <Hero items={featured} />
      <div className="relative z-10 -mt-4 space-y-1">
        {continueList.length > 0 && (
          <Row
            title={T.continueWatching}
            icon={<Clock className="size-5 text-primary" />}
            items={continueList}
          />
        )}
        <Row
          title={T.trending}
          icon={<Flame className="size-5 text-primary" />}
          items={trending}
          onSeeAll={() => nav({ name: 'browse' })}
        />
        <Row
          title={T.vipExclusive}
          icon={<Crown className="size-5 text-vip" />}
          items={vip}
          onSeeAll={() => nav({ name: 'plans' })}
        />
        <Row
          title={T.featuredMovies}
          icon={<Film className="size-5 text-primary" />}
          items={movies}
          onSeeAll={() => nav({ name: 'browse', type: 'MOVIE' })}
        />
        <Row
          title={T.featuredSeries}
          icon={<Tv className="size-5 text-primary" />}
          items={series}
          onSeeAll={() => nav({ name: 'browse', type: 'SERIES' })}
        />
        <Row
          title={T.animeZone}
          icon={<Sparkles className="size-5 text-primary" />}
          items={anime}
          onSeeAll={() => nav({ name: 'browse', genre: 'anime' })}
        />
        <Row
          title={T.newOnShasha}
          icon={<Ghost className="size-5 text-primary" />}
          items={newest}
          onSeeAll={() => nav({ name: 'browse' })}
        />
      </div>
    </div>
  );
}
