'use client';

// متجر الحالة العام (Zustand) — التنقل، اللغة، المستخدم
import { create } from 'zustand';
import type { Lang, PublicUser, View } from './types';
import { api } from './api-client';

export function viewToHash(v: View): string {
  switch (v.name) {
    case 'home':
      return '#/';
    case 'browse': {
      const params = new URLSearchParams();
      if (v.type) params.set('type', v.type);
      if (v.genre) params.set('genre', v.genre);
      if (v.vip) params.set('vip', '1');
      const q = params.toString();
      return `#/browse${q ? `?${q}` : ''}`;
    }
    case 'search':
      return `#/search${v.q ? `?q=${encodeURIComponent(v.q)}` : ''}`;
    case 'details':
      return `#/t/${v.slug}`;
    case 'player': {
      const params = new URLSearchParams();
      if (v.episodeId) params.set('e', v.episodeId);
      const q = params.toString();
      return `#/watch/${v.slug}${q ? `?${q}` : ''}`;
    }
    case 'watchlist':
      return '#/list';
    case 'plans':
      return '#/vip';
    case 'app':
      return '#/app';
    default:
      return '#/';
  }
}

export function hashToView(hash: string): View {
  const h = hash.replace(/^#/, '') || '/';
  const [path, query] = h.split('?');
  const params = new URLSearchParams(query || '');
  const parts = path.split('/').filter(Boolean);

  if (parts.length === 0) return { name: 'home' };
  if (parts[0] === 'browse') {
    return {
      name: 'browse',
      type: params.get('type') || undefined,
      genre: params.get('genre') || undefined,
      vip: params.get('vip') === '1',
    };
  }
  if (parts[0] === 'search') return { name: 'search', q: params.get('q') || undefined };
  if (parts[0] === 't' && parts[1]) return { name: 'details', slug: parts[1] };
  if (parts[0] === 'watch' && parts[1]) return { name: 'player', slug: parts[1], episodeId: params.get('e') || undefined };
  if (parts[0] === 'list') return { name: 'watchlist' };
  if (parts[0] === 'vip') return { name: 'plans' };
  if (parts[0] === 'app') return { name: 'app' };
  return { name: 'home' };
}

interface AppStore {
  user: PublicUser | null;
  userLoaded: boolean;
  setUser: (u: PublicUser | null) => void;
  refreshUser: () => Promise<void>;

  lang: Lang;
  setLang: (l: Lang) => void;

  view: View;
  setView: (v: View) => void;

  authOpen: boolean;
  authTab: 'login' | 'register';
  openAuth: (tab?: 'login' | 'register') => void;
  closeAuth: () => void;

  installEvent: any | null;
  setInstallEvent: (e: any | null) => void;
}

export const useApp = create<AppStore>((set, get) => ({
  user: null,
  userLoaded: false,
  setUser: (u) => set({ user: u, userLoaded: true }),
  refreshUser: async () => {
    try {
      const json = await api<any>('/api/auth/me');
      set({ user: json?.user ?? null, userLoaded: true });
    } catch {
      set({ user: null, userLoaded: true });
    }
  },

  lang: 'ar',
  setLang: (l) => {
    set({ lang: l });
    try {
      localStorage.setItem('shasha_lang', l);
    } catch {}
    if (typeof document !== 'undefined') {
      document.documentElement.lang = l;
      document.documentElement.dir = l === 'ar' ? 'rtl' : 'ltr';
    }
  },

  view: { name: 'home' },
  setView: (v) => set({ view: v }),

  authOpen: false,
  authTab: 'login',
  openAuth: (tab = 'login') => set({ authOpen: true, authTab: tab }),
  closeAuth: () => set({ authOpen: false }),

  installEvent: null,
  setInstallEvent: (e) => set({ installEvent: e }),
}));
