'use client';

// قائمتي (المفضلة)
import { Bookmark, Compass } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useApi } from '@/lib/api-client';
import { useApp } from '@/lib/store';
import { getDict } from '@/lib/i18n';
import type { TitleCard } from '@/lib/types';
import { MediaGrid } from './media-card';
import { EmptyState } from './ui-bits';
import { nav } from './ui-bits';

export function WatchlistView() {
  const lang = useApp((s) => s.lang);
  const user = useApp((s) => s.user);
  const openAuth = useApp((s) => s.openAuth);
  const T = getDict(lang);
  const { data: items, loading } = useApi<TitleCard[]>(user ? '/api/watchlist' : null);

  if (!user) {
    return (
      <div className="pt-24 md:pt-28">
        <EmptyState
          icon={<Bookmark className="size-9" />}
          title={T.myList}
          hint={T.errLoginRequired}
          action={
            <Button
              onClick={() => openAuth('login')}
              className="mt-2 rounded-xl bg-primary font-black text-primary-foreground hover:bg-primary/90"
            >
              {T.login}
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="pt-24 md:pt-28">
      <h1 className="mb-6 flex items-center gap-2 px-4 text-2xl font-black md:px-8 md:text-3xl">
        <Bookmark className="size-7 text-primary" />
        {T.myList}
      </h1>
      {loading ? (
        <MediaGrid loading />
      ) : (items ?? []).length === 0 ? (
        <EmptyState
          icon={<Bookmark className="size-9" />}
          title={T.myListEmpty}
          hint={T.myListEmptyHint}
          action={
            <Button
              onClick={() => nav({ name: 'browse' })}
              className="mt-2 rounded-xl bg-primary font-black text-primary-foreground hover:bg-primary/90"
            >
              <Compass className="size-4" />
              {T.browseNow}
            </Button>
          }
        />
      ) : (
        <MediaGrid items={items} />
      )}
    </div>
  );
}
