'use client';

// صفحة البحث
import { useEffect, useRef, useState } from 'react';
import { Search, SearchX } from 'lucide-react';
import { useApi } from '@/lib/api-client';
import { useApp } from '@/lib/store';
import { getDict } from '@/lib/i18n';
import type { TitleCard } from '@/lib/types';
import { MediaGrid } from './media-card';
import { EmptyState } from './ui-bits';
import { Input } from '@/components/ui/input';

export function SearchView({ initialQ }: { initialQ?: string }) {
  const lang = useApp((s) => s.lang);
  const T = getDict(lang);
  const [q, setQ] = useState(initialQ || '');
  const [debounced, setDebounced] = useState(initialQ || '');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(q.trim()), 350);
    return () => clearTimeout(t);
  }, [q]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const { data: items, loading } = useApi<TitleCard[]>(
    debounced ? `/api/titles?q=${encodeURIComponent(debounced)}&limit=40` : null
  );

  return (
    <div className="pt-24 md:pt-28">
      <div className="mx-auto max-w-2xl px-4 md:px-8">
        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 size-5 -translate-y-1/2 text-muted-foreground start-4" />
          <Input
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={T.searchPlaceholder}
            className="h-14 rounded-2xl border-white/10 bg-black/40 ps-12 text-lg font-semibold focus-visible:ring-primary/60"
          />
        </div>
      </div>

      <div className="mt-8">
        {!debounced ? (
          <EmptyState
            icon={<Search className="size-9" />}
            title={T.searchAction}
            hint={T.searchPlaceholder}
          />
        ) : loading ? (
          <MediaGrid loading />
        ) : (items ?? []).length === 0 ? (
          <EmptyState icon={<SearchX className="size-9" />} title={T.noResults} hint={T.noResultsHint} />
        ) : (
          <MediaGrid items={items} />
        )}
      </div>
    </div>
  );
}
