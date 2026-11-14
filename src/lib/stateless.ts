// وضع الخادم بلا قاعدة بيانات (Vercel / serverless)
// ---------------------------------------------------
// جلسات موقّعة HMAC-SHA256 + بيانات المستخدم (المفضلة/التقدم) داخل كوكيز موقعة.
// يعمل بأمان عبر عدة نسخ دوال serverless دون حالة مشتركة.
// الكتالوج والباقات تُقرأ من demo-data.json، والتحقق من صلاحيات VIP
// يتم على الخادم قبل كشف أي رابط تشغيل — تماماً كوضع قاعدة البيانات.
import { NextRequest, NextResponse } from 'next/server';
import { createHmac, timingSafeEqual, randomBytes } from 'crypto';
import demoData from './demo-data.json';

export const STATELESS = process.env.SERVERLESS === '1';

const SECRET = process.env.AUTH_SECRET || 'shasha-dev-secret-change-me';
const SESSION_COOKIE = 'shasha_session';
const DATA_COOKIE = 'shasha_data';
const SESSION_DAYS = 30;
const MAX_WL = 120;
const MAX_PG = 40;

// ============ توقيع وتحقق ============

function b64url(s: string): string {
  return Buffer.from(s, 'utf8').toString('base64url');
}

function sign(payload: object): string {
  const body = b64url(JSON.stringify(payload));
  const mac = createHmac('sha256', SECRET).update(body).digest('base64url');
  return `${body}.${mac}`;
}

function verify(token: string | undefined | null): any | null {
  if (!token || !token.includes('.')) return null;
  const [body, mac] = token.split('.');
  if (!body || !mac) return null;
  try {
    const expect = createHmac('sha256', SECRET).update(body).digest('base64url');
    const a = Buffer.from(mac);
    const b = Buffer.from(expect);
    if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
    if (!payload || typeof payload.exp !== 'number' || payload.exp < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

// ============ حسابات العرض التجريبية ============
// بيانات دخول معلنة للجميع (موثّقة في README) — تحقق ثابت الزمن على الخادم
const DEMO_ACCOUNTS: Record<string, { password: string; name: string; color: string; vipDays: number; id: string }> = {
  'demo@shasha.app': { password: 'demo1234', name: 'مشترك VIP تجريبي', color: '#e8b923', vipDays: 3650, id: 'demo-vip' },
  'free@shasha.app': { password: 'demo1234', name: 'مستخدم مجاني تجريبي', color: '#00d26a', vipDays: 0, id: 'demo-free' },
};

function safeEq(a: string, b: string): boolean {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ba.length !== bb.length) {
    // قارن بطول موحّد كي لا يكشف الطول شيئاً
    timingSafeEqual(Buffer.from(a.padEnd(64, '\0')), Buffer.from(b.padEnd(64, '\0')));
    return false;
  }
  return timingSafeEqual(ba, bb);
}

// ============ أشكال المستخدم ============

interface SUser {
  id: string;
  email: string;
  name: string;
  avatarColor: string;
  vipUntil: string | null;
}

function isVipU(u: SUser | null): boolean {
  return !!u?.vipUntil && new Date(u.vipUntil).getTime() > Date.now();
}

function publicUser(u: SUser) {
  return {
    id: u.id,
    email: u.email,
    name: u.name,
    avatarColor: u.avatarColor,
    isVip: isVipU(u),
    vipUntil: u.vipUntil,
  };
}

// ============ قراءة/كتابة الكوكيز ============

function readUser(req: NextRequest): SUser | null {
  const p = verify(req.cookies.get(SESSION_COOKIE)?.value);
  return p?.u ?? null;
}

function sessionCookieOpts(maxAgeSec: number) {
  return {
    httpOnly: true,
    sameSite: 'lax' as const,
    secure: true,
    path: '/',
    maxAge: maxAgeSec,
  };
}

function setSession(res: NextResponse, u: SUser) {
  const exp = Date.now() + SESSION_DAYS * 86400000;
  res.cookies.set(SESSION_COOKIE, sign({ u, exp }), sessionCookieOpts(SESSION_DAYS * 86400));
}

function clearCookies(res: NextResponse) {
  res.cookies.set(SESSION_COOKIE, '', sessionCookieOpts(0));
  res.cookies.set(DATA_COOKIE, '', sessionCookieOpts(0));
}

interface PgEntry { e: string | null; p: number; d: number; t: number }
interface UserData { wl: string[]; pg: Record<string, PgEntry> }

function readData(req: NextRequest): UserData {
  const p = verify(req.cookies.get(DATA_COOKIE)?.value);
  const d = p?.d;
  if (!d || typeof d !== 'object') return { wl: [], pg: {} };
  return { wl: Array.isArray(d.wl) ? d.wl : [], pg: d.pg && typeof d.pg === 'object' ? d.pg : {} };
}

function trimData(d: UserData): UserData {
  const wl = d.wl.slice(0, MAX_WL);
  const entries = Object.entries(d.pg).sort((a, b) => (b[1]?.t ?? 0) - (a[1]?.t ?? 0)).slice(0, MAX_PG);
  return { wl, pg: Object.fromEntries(entries) };
}

function setData(res: NextResponse, d: UserData) {
  const t = trimData(d);
  res.cookies.set(DATA_COOKIE, sign({ d: t, exp: Date.now() + 365 * 86400000 }), {
    ...sessionCookieOpts(365 * 86400),
  });
}

// ============ الكتالوج ============

const TITLES: any[] = (demoData as any).titles || [];
const PLANS: any[] = (demoData as any).plans || [];
const GENRES: any[] = (demoData as any).genres || [];

function findTitle(slug: string) {
  return TITLES.find((t) => t.slug === slug) || null;
}

function cardBase(t: any) {
  const { episodes, sourceType, sourceUrl, fallbackUrl, synopsisAr, synopsisEn, ...rest } = t;
  return rest;
}

function withUserFlags(t: any, data: UserData) {
  const p = data.pg[t.slug];
  return {
    ...cardBase(t),
    inWatchlist: data.wl.includes(t.slug),
    progressPct: p && p.d > 0 ? Math.min(100, (p.p / p.d) * 100) : 0,
    progressPositionSec: p?.p ?? 0,
    progressDurationSec: p?.d ?? 0,
    progressEpisodeId: p?.e ?? null,
  };
}

function episodeInfo(e: any) {
  return {
    id: e.id,
    season: e.season,
    number: e.number,
    nameAr: e.nameAr,
    nameEn: e.nameEn,
    durationMin: e.durationMin,
    isPremium: e.isPremium,
  };
}

// ============ المعالجات (نفس أشكال استجابات وضع قاعدة البيانات) ============

export function slWhoami(req: NextRequest) {
  const u = readUser(req);
  return NextResponse.json({ ok: true, user: u ? publicUser(u) : null });
}

export async function slLogin(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const email = String(body?.email || '').trim().toLowerCase();
  const password = String(body?.password || '');
  const acc = DEMO_ACCOUNTS[email];
  if (!acc || !password || !safeEq(password, acc.password)) {
    return NextResponse.json({ ok: false, error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' }, { status: 401 });
  }
  const u: SUser = {
    id: acc.id,
    email,
    name: acc.name,
    avatarColor: acc.color,
    vipUntil: acc.vipDays > 0 ? new Date(Date.now() + acc.vipDays * 86400000).toISOString() : null,
  };
  const res = NextResponse.json({ ok: true, data: { user: publicUser(u) } });
  setSession(res, u);
  return res;
}

export async function slRegister(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const email = String(body?.email || '').trim().toLowerCase();
  const name = String(body?.name || '').trim();
  const password = String(body?.password || '');
  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!email || !name || !password) {
    return NextResponse.json({ ok: false, error: 'تحقق من البيانات المدخلة' }, { status: 400 });
  }
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ ok: false, error: 'بريد إلكتروني غير صالح' }, { status: 400 });
  }
  if (password.length < 6) {
    return NextResponse.json({ ok: false, error: 'كلمة المرور 6 أحرف على الأقل' }, { status: 400 });
  }

  const colors = ['#00d26a', '#e8b923', '#ff6b6b', '#4ecdc4', '#f7b731', '#a55eea'];
  const u: SUser = {
    id: 'su-' + randomBytes(6).toString('hex'),
    email,
    name,
    avatarColor: colors[Math.floor(Math.random() * colors.length)],
    vipUntil: null,
  };
  const res = NextResponse.json({ ok: true, data: { user: publicUser(u) } });
  setSession(res, u);
  setData(res, { wl: [], pg: {} });
  return res;
}

export function slLogout() {
  const res = NextResponse.json({ ok: true, data: {} });
  clearCookies(res);
  return res;
}

export function slGenres() {
  return NextResponse.json({ ok: true, data: GENRES });
}

export function slPlans() {
  return NextResponse.json({ ok: true, data: PLANS });
}

export function slTitles(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const type = sp.get('type');
  const genre = sp.get('genre');
  const q = sp.get('q');
  const section = sp.get('section');
  const sort = sp.get('sort') || 'popular';
  const limit = Math.min(60, parseInt(sp.get('limit') || '24', 10) || 24);

  let list = [...TITLES];
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
  else list.sort((a, b) => (b.score ?? 0) - (a.score ?? 0) || (b.year ?? 0) - (a.year ?? 0));

  const data = readData(req);
  return NextResponse.json({ ok: true, data: list.slice(0, limit).map((t) => withUserFlags(t, data)) });
}

export function slTitleDetail(req: NextRequest, slug: string) {
  const t = findTitle(slug);
  if (!t) return NextResponse.json({ ok: false, error: 'العمل غير موجود' }, { status: 404 });
  const data = readData(req);
  const user = readUser(req);
  const genreSlugs = t.genres.map((g: any) => g.slug);
  const similar = TITLES.filter(
    (x: any) => x.id !== t.id && x.genres.some((g: any) => genreSlugs.includes(g.slug))
  )
    .sort((a: any, b: any) => (b.score ?? 0) - (a.score ?? 0))
    .slice(0, 8)
    .map((x: any) => ({ ...cardBase(x), inWatchlist: false, progressPct: 0 }));

  return NextResponse.json({
    ok: true,
    data: {
      ...withUserFlags(t, data),
      synopsisAr: t.synopsisAr,
      synopsisEn: t.synopsisEn,
      episodes: (t.episodes || []).map(episodeInfo),
      similar,
      canPlayVip: isVipU(user),
    },
  });
}

export function slPlay(req: NextRequest, slug: string) {
  const t = findTitle(slug);
  if (!t) return NextResponse.json({ ok: false, error: 'العمل غير موجود', code: 'not_found' }, { status: 404 });
  if (t.releaseState === 'coming_soon') {
    return NextResponse.json({ ok: false, error: 'هذا العمل لم يتوفر بعد', code: 'not_available' }, { status: 403 });
  }

  const episodeId = req.nextUrl.searchParams.get('e');
  const episodes = t.episodes || [];
  const episode = episodeId ? episodes.find((e: any) => e.id === episodeId) : episodes[0] || null;

  let source: any;
  if (t.type === 'SERIES') {
    if (!episode) {
      return NextResponse.json({ ok: false, error: 'الحلقة غير موجودة', code: 'no_episode' }, { status: 400 });
    }
    source = episode;
  } else {
    source = t;
  }

  if (!source.sourceUrl) {
    return NextResponse.json({ ok: false, error: 'لا يوجد مصدر تشغيل', code: 'no_source' }, { status: 404 });
  }

  const user = readUser(req);
  if (source.isPremium) {
    if (!user) {
      return NextResponse.json({ ok: false, error: 'سجّل الدخول أولاً', code: 'auth_required' }, { status: 401 });
    }
    if (!isVipU(user)) {
      return NextResponse.json({ ok: false, error: 'هذا المحتوى متاح لمشتركي VIP', code: 'vip_required' }, { status: 403 });
    }
  }

  // استئناف من آخر موضع
  let resumeAt = 0;
  const p = readData(req).pg[t.slug];
  if (p && p.e === (episode?.id ?? null) && p.p > 5) {
    const pct = p.d > 0 ? p.p / p.d : 0;
    if (pct < 0.95) resumeAt = p.p;
  }

  const eps = episodes.map(episodeInfo);
  const idx = episode ? eps.findIndex((e: any) => e.id === episode.id) : -1;

  return NextResponse.json({
    ok: true,
    data: {
      sourceType: source.sourceType,
      sourceUrl: source.sourceUrl,
      fallbackUrl: source.fallbackUrl ?? null,
      titleSlug: t.slug,
      titleAr: t.titleAr,
      titleEn: t.titleEn,
      episodeId: episode?.id ?? null,
      episodeNameAr: episode?.nameAr ?? null,
      episodeNameEn: episode?.nameEn ?? null,
      episodes: eps,
      nextEpisodeId: idx >= 0 && idx < eps.length - 1 ? eps[idx + 1].id : null,
      resumeAt,
    },
  });
}

export function slWatchlistGet(req: NextRequest) {
  const user = readUser(req);
  if (!user) return NextResponse.json({ ok: true, data: [] });
  const data = readData(req);
  const items = data.wl.map((s) => findTitle(s)).filter(Boolean).map((t: any) => withUserFlags(t, data));
  return NextResponse.json({ ok: true, data: items });
}

export async function slWatchlistPost(req: NextRequest) {
  const user = readUser(req);
  if (!user) return NextResponse.json({ ok: false, error: 'سجّل الدخول أولاً', code: 'auth_required' }, { status: 401 });
  const body = await req.json().catch(() => null);
  const slug = String(body?.slug || '');
  if (!findTitle(slug)) return NextResponse.json({ ok: false, error: 'العمل غير موجود' }, { status: 404 });
  const data = readData(req);
  if (!data.wl.includes(slug)) data.wl.unshift(slug);
  const res = NextResponse.json({ ok: true, data: { inWatchlist: true } });
  setData(res, data);
  return res;
}

export function slWatchlistDelete(req: NextRequest) {
  const user = readUser(req);
  if (!user) return NextResponse.json({ ok: false, error: 'سجّل الدخول أولاً', code: 'auth_required' }, { status: 401 });
  const slug = req.nextUrl.searchParams.get('slug') || '';
  if (!findTitle(slug)) return NextResponse.json({ ok: false, error: 'العمل غير موجود' }, { status: 404 });
  const data = readData(req);
  data.wl = data.wl.filter((s) => s !== slug);
  const res = NextResponse.json({ ok: true, data: { inWatchlist: false } });
  setData(res, data);
  return res;
}

export function slProgressGet(req: NextRequest) {
  const user = readUser(req);
  if (!user) return NextResponse.json({ ok: true, data: { list: [], single: null } });
  const data = readData(req);
  const slug = req.nextUrl.searchParams.get('slug');
  if (slug) {
    const p = data.pg[slug];
    return NextResponse.json({
      ok: true,
      data: {
        list: [],
        single: p ? { episodeId: p.e, positionSec: p.p, durationSec: p.d, updatedAt: new Date(p.t).toISOString() } : null,
      },
    });
  }
  const list = TITLES.filter((t) => data.pg[t.slug] && data.pg[t.slug].p > 5)
    .sort((a, b) => (data.pg[b.slug]?.t ?? 0) - (data.pg[a.slug]?.t ?? 0))
    .slice(0, 12)
    .map((t) => ({ ...withUserFlags(t, data), progressEpisodeId: data.pg[t.slug]?.e ?? null }));
  return NextResponse.json({ ok: true, data: { list, single: null } });
}

export async function slProgressPost(req: NextRequest) {
  const user = readUser(req);
  if (!user) return NextResponse.json({ ok: true, data: {} });
  const body = await req.json().catch(() => null);
  const slug = String(body?.slug || '');
  if (!findTitle(slug)) return NextResponse.json({ ok: false, error: 'not found' }, { status: 404 });
  const data = readData(req);
  data.pg[slug] = {
    e: body?.episodeId ? String(body.episodeId) : null,
    p: Math.max(0, Math.floor(Number(body?.positionSec) || 0)),
    d: Math.max(0, Math.floor(Number(body?.durationSec) || 0)),
    t: Date.now(),
  };
  const res = NextResponse.json({ ok: true, data: {} });
  setData(res, data);
  return res;
}

export async function slSubscribePost(req: NextRequest) {
  const user = readUser(req);
  if (!user) return NextResponse.json({ ok: false, error: 'سجّل الدخول أولاً', code: 'auth_required' }, { status: 401 });
  const body = await req.json().catch(() => null);
  const planCode = String(body?.planCode || '');
  const plan = PLANS.find((p: any) => p.code === planCode);
  if (!plan) return NextResponse.json({ ok: false, error: 'الباقة غير موجودة' }, { status: 404 });

  const base = user.vipUntil && new Date(user.vipUntil).getTime() > Date.now() ? new Date(user.vipUntil) : new Date();
  const expiresAt = new Date(base.getTime() + plan.months * 30 * 86400000);
  const updated: SUser = { ...user, vipUntil: expiresAt.toISOString() };

  const res = NextResponse.json({ ok: true, data: { user: publicUser(updated), expiresAt: expiresAt.toISOString() } });
  setSession(res, updated);
  return res;
}

export function slSubscribeDelete(req: NextRequest) {
  const user = readUser(req);
  if (!user) return NextResponse.json({ ok: false, error: 'سجّل الدخول أولاً', code: 'auth_required' }, { status: 401 });
  const updated: SUser = { ...user, vipUntil: new Date().toISOString() };
  const res = NextResponse.json({ ok: true, data: { user: publicUser(updated) } });
  setSession(res, updated);
  return res;
}
