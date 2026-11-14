'use client';

// مزوّد API تجريبي محلي (localStorage) — يعمل في نسخة العرض الثابتة فقط
// يحاكي كل مسارات الخادم بنفس أشكال البيانات والأكواد
import demoData from './demo-data.json';

const KEYS = {
  user: 'shasha_demo_user',
  list: 'shasha_demo_list',
  prog: 'shasha_demo_prog',
};

export interface DemoUser {
  id: string;
  email: string;
  name: string;
  avatarColor: string;
  isVip: boolean;
  vipUntil: string | null;
}

function ls<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function lsSet(key: string, val: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch {}
}

function getUser(): DemoUser | null {
  const u = ls<DemoUser | null>(KEYS.user, null);
  if (u && u.vipUntil) u.isVip = new Date(u.vipUntil).getTime() > Date.now();
  return u;
}

function err(message: string, status: number, code?: string): never {
  const e: any = new Error(message);
  e.status = status;
  e.code = code;
  throw e;
}

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

function withUserFlags(t: any) {
  const user = getUser();
  const list = user ? ls<string[]>(KEYS.list, []) : [];
  const prog = user ? ls<Record<string, any>>(KEYS.prog, {}) : {};
  const p = prog[t.slug];
  return {
    ...t,
    episodes: undefined,
    inWatchlist: list.includes(t.slug),
    progressPct: p && p.durationSec > 0 ? Math.min(100, (p.positionSec / p.durationSec) * 100) : 0,
    progressPositionSec: p?.positionSec ?? 0,
    progressDurationSec: p?.durationSec ?? 0,
    progressEpisodeId: p?.episodeId ?? null,
  };
}

export async function demoApi(url: string, init?: RequestInit): Promise<any> {
  await delay(60);
  const method = (init?.method || 'GET').toUpperCase();
  const [pathRaw, qs] = url.split('?');
  const params = new URLSearchParams(qs || '');
  const path = pathRaw.replace(/\/$/, '') || '/';
  const body = init?.body ? JSON.parse(String(init.body)) : {};

  // ===== المصادقة =====
  if (path === '/api/auth/me') return getUser();

  if (path === '/api/auth/login' && method === 'POST') {
    const email = String(body.email || '').toLowerCase().trim();
    if (!email || !body.password) err('تحقق من البيانات المدخلة', 400);
    const name = email.split('@')[0].replace(/[._-]+/g, ' ');
    const user: DemoUser = {
      id: 'demo-' + email.replace(/[^a-z0-9]/g, ''),
      email,
      name: name || 'مستخدم شاشة',
      avatarColor: '#00d26a',
      isVip: email.startsWith('demo@'),
      vipUntil: email.startsWith('demo@') ? new Date(Date.now() + 30 * 86400000).toISOString() : null,
    };
    lsSet(KEYS.user, user);
    return { user };
  }

  if (path === '/api/auth/register' && method === 'POST') {
    const email = String(body.email || '').toLowerCase().trim();
    if (!email || !body.name || !body.password) err('تحقق من البيانات المدخلة', 400);
    if (String(body.password).length < 6) err('كلمة المرور 6 أحرف على الأقل', 400);
    const user: DemoUser = {
      id: 'demo-' + email.replace(/[^a-z0-9]/g, ''),
      email,
      name: String(body.name),
      avatarColor: '#e8b923',
      isVip: false,
      vipUntil: null,
    };
    lsSet(KEYS.user, user);
    return { user };
  }

  if (path === '/api/auth/logout' && method === 'POST') {
    lsSet(KEYS.user, null);
    return {};
  }

  // ===== التصنيفات والباقات =====
  if (path === '/api/genres') return (demoData as any).genres;
  if (path === '/api/plans') return (demoData as any).plans;

  // ===== القوائم =====
  if (path === '/api/titles') {
    const type = params.get('type');
    const genre = params.get('genre');
    const q = params.get('q');
    const section = params.get('section');
    const sort = params.get('sort') || 'popular';
    let list: any[] = [...(demoData as any).titles];
    if (type) list = list.filter((t) => t.type === type);
    if (genre) list = list.filter((t) => t.genres.some((g: any) => g.slug === genre));
    if (section === 'vip') list = list.filter((t) => t.isPremium);
    if (section === 'featured') list = list.filter((t) => t.featured);
    if (section === 'trending') list = list.filter((t) => t.trending != null);
    if (q) {
      const needle = q.toLowerCase();
      list = list.filter(
        (t) =>
          t.titleAr.includes(q) ||
          t.titleEn.toLowerCase().includes(needle) ||
          t.synopsisAr.includes(q) ||
          t.synopsisEn.toLowerCase().includes(needle)
      );
    }
    if (section === 'trending') list.sort((a, b) => (a.trending ?? 99) - (b.trending ?? 99));
    else if (sort === 'rated') list.sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
    else if (sort === 'newest') list.sort((a, b) => (b.year ?? 0) - (a.year ?? 0));
    else {
      list.sort((a, b) => (b.score ?? 0) - (a.score ?? 0) || (b.year ?? 0) - (a.year ?? 0));
    }
    const limit = Math.min(60, parseInt(params.get('limit') || '24', 10) || 24);
    return list.slice(0, limit).map(withUserFlags);
  }

  // ===== التفاصيل =====
  const mDetail = path.match(/^\/api\/titles\/([^/]+)$/);
  if (mDetail) {
    const t = (demoData as any).titles.find((x) => x.slug === mDetail[1]);
    if (!t) err('العمل غير موجود', 404, 'not_found');
    const genreSlugs = t.genres.map((g: any) => g.slug);
    const similar = (demoData as any).titles
      .filter((x: any) => x.id !== t.id && x.genres.some((g: any) => genreSlugs.includes(g.slug)))
      .sort((a: any, b: any) => (b.score ?? 0) - (a.score ?? 0))
      .slice(0, 8)
      .map((x: any) => ({ ...x, episodes: undefined, inWatchlist: false, progressPct: 0 }));
    const user = getUser();
    return {
      ...withUserFlags(t),
      episodes: t.episodes,
      similar,
      canPlayVip: !!user?.isVip,
    };
  }

  // ===== التشغيل (فحص الصلاحية) =====
  const mPlay = path.match(/^\/api\/titles\/([^/]+)\/play$/);
  if (mPlay) {
    const t = (demoData as any).titles.find((x) => x.slug === mPlay[1]);
    if (!t) err('العمل غير موجود', 404, 'not_found');
    if (t.releaseState === 'coming_soon') err('هذا العمل لم يتوفر بعد', 403, 'not_available');
    const epId = params.get('e');
    const episode = epId ? t.episodes.find((e: any) => e.id === epId) : t.episodes[0] || null;
    const source: any = t.type === 'SERIES' ? (episode ?? err('الحلقة غير موجودة', 400, 'no_episode')) : t;
    if (!source?.sourceUrl) err('لا يوجد مصدر تشغيل', 404, 'no_source');
    if (source.isPremium) {
      const user = getUser();
      if (!user) err('سجّل الدخول أولاً', 401, 'auth_required');
      if (!user.isVip) err('هذا المحتوى متاح لمشتركي VIP', 403, 'vip_required');
    }
    // استئناف
    let resumeAt = 0;
    const user = getUser();
    if (user) {
      const p = ls<Record<string, any>>(KEYS.prog, {})[t.slug];
      if (p && p.episodeId === (episode?.id ?? null) && p.positionSec > 5) {
        const pct = p.durationSec > 0 ? p.positionSec / p.durationSec : 0;
        if (pct < 0.95) resumeAt = p.positionSec;
      }
    }
    const eps = t.episodes.map((e: any) => ({
      id: e.id, season: e.season, number: e.number, nameAr: e.nameAr, nameEn: e.nameEn,
      durationMin: e.durationMin, isPremium: e.isPremium,
    }));
    const idx = episode ? eps.findIndex((e: any) => e.id === episode.id) : -1;
    return {
      sourceType: source.sourceType,
      sourceUrl: source.sourceUrl,
      fallbackUrl: source.fallbackUrl,
      titleSlug: t.slug,
      titleAr: t.titleAr,
      titleEn: t.titleEn,
      episodeId: episode?.id ?? null,
      episodeNameAr: episode?.nameAr ?? null,
      episodeNameEn: episode?.nameEn ?? null,
      episodes: eps,
      nextEpisodeId: idx >= 0 && idx < eps.length - 1 ? eps[idx + 1].id : null,
      resumeAt,
    };
  }

  // ===== المفضلة =====
  if (path === '/api/watchlist') {
    const user = getUser();
    if (method === 'GET') {
      if (!user) return [];
      const slugs = ls<string[]>(KEYS.list, []);
      return (demoData as any).titles.filter((t: any) => slugs.includes(t.slug)).map(withUserFlags);
    }
    if (method === 'POST') {
      if (!user) err('سجّل الدخول أولاً', 401, 'auth_required');
      const list = ls<string[]>(KEYS.list, []);
      if (!list.includes(body.slug)) list.unshift(body.slug);
      lsSet(KEYS.list, list);
      return { inWatchlist: true };
    }
    if (method === 'DELETE') {
      if (!user) err('سجّل الدخول أولاً', 401, 'auth_required');
      const slug = params.get('slug') || '';
      const list = ls<string[]>(KEYS.list, []).filter((s) => s !== slug);
      lsSet(KEYS.list, list);
      return { inWatchlist: false };
    }
  }

  // ===== التقدم =====
  if (path === '/api/progress') {
    const user = getUser();
    if (method === 'POST') {
      if (!user) return {};
      const prog = ls<Record<string, any>>(KEYS.prog, {});
      prog[body.slug] = {
        episodeId: body.episodeId ?? null,
        positionSec: Math.floor(body.positionSec || 0),
        durationSec: Math.floor(body.durationSec || 0),
        updatedAt: Date.now(),
      };
      lsSet(KEYS.prog, prog);
      return {};
    }
    if (method === 'GET') {
      if (!user) return { list: [], single: null };
      const prog = ls<Record<string, any>>(KEYS.prog, {});
      if (params.get('slug')) {
        return { list: [], single: prog[params.get('slug')!] ?? null };
      }
      const list = (demoData as any).titles
        .filter((t: any) => prog[t.slug] && prog[t.slug].positionSec > 5)
        .sort((a: any, b: any) => (prog[b.slug]?.updatedAt ?? 0) - (prog[a.slug]?.updatedAt ?? 0))
        .slice(0, 12)
        .map((t: any) => ({ ...withUserFlags(t), progressEpisodeId: prog[t.slug]?.episodeId ?? null }));
      return { list, single: null };
    }
  }

  // ===== الاشتراك =====
  if (path === '/api/subscribe') {
    const user = getUser();
    if (!user) err('سجّل الدخول أولاً', 401, 'auth_required');
    if (method === 'POST') {
      const plan = (demoData as any).plans.find((p: any) => p.code === body.planCode);
      if (!plan) err('الباقة غير موجودة', 404);
      const base = user.vipUntil && new Date(user.vipUntil).getTime() > Date.now() ? new Date(user.vipUntil) : new Date();
      const expiresAt = new Date(base.getTime() + plan.months * 30 * 86400000);
      const updated = { ...user, isVip: true, vipUntil: expiresAt.toISOString() };
      lsSet(KEYS.user, updated);
      return { user: updated, expiresAt: expiresAt.toISOString() };
    }
    if (method === 'DELETE') {
      const updated = { ...user, isVip: false, vipUntil: new Date().toISOString() };
      lsSet(KEYS.user, updated);
      return { user: updated };
    }
  }

  err(`مسار غير مدعوم في وضع العرض: ${path}`, 404);
}
