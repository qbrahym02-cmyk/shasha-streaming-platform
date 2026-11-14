// أنواع مشتركة بين الواجهة والخادم

export type Lang = 'ar' | 'en';
export type TitleType = 'MOVIE' | 'SERIES';
export type ReleaseState = 'released' | 'coming_soon';

export interface PublicUser {
  id: string;
  email: string;
  name: string;
  avatarColor: string;
  isVip: boolean;
  vipUntil: string | null;
}

export interface GenreInfo {
  slug: string;
  nameAr: string;
  nameEn: string;
}

export interface EpisodeInfo {
  id: string;
  season: number;
  number: number;
  nameAr: string;
  nameEn: string;
  durationMin: number | null;
  isPremium: boolean;
}

export interface TitleCard {
  id: string;
  slug: string;
  type: TitleType;
  titleAr: string;
  titleEn: string;
  synopsisAr?: string;
  synopsisEn?: string;
  poster: string;
  backdrop: string | null;
  year: number | null;
  ageRating: string | null;
  score: number | null;
  durationMin: number | null;
  isPremium: boolean;
  releaseState: ReleaseState;
  trending: number | null;
  genres: GenreInfo[];
  // خاصة بالمستخدم الحالي
  inWatchlist?: boolean;
  progressPct?: number;
  progressPositionSec?: number;
  progressDurationSec?: number;
  progressEpisodeId?: string | null;
}

export interface TitleDetail extends TitleCard {
  synopsisAr: string;
  synopsisEn: string;
  episodes: EpisodeInfo[];
  similar: TitleCard[];
}

export interface PlaySource {
  ok: true;
  sourceType: string;
  sourceUrl: string;
  fallbackUrl: string | null;
  titleSlug: string;
  titleAr: string;
  titleEn: string;
  episodeId: string | null;
  episodeNameAr: string | null;
  episodeNameEn: string | null;
  episodes: EpisodeInfo[];
  nextEpisodeId: string | null;
  resumeAt: number;
}

export interface PlanInfo {
  code: string;
  nameAr: string;
  nameEn: string;
  priceDzd: number;
  originalDzd: number | null;
  months: number;
  featuresAr: string[];
  featuresEn: string[];
  highlight: boolean;
}

export type View =
  | { name: 'home' }
  | { name: 'browse'; type?: string; genre?: string; vip?: boolean }
  | { name: 'search'; q?: string }
  | { name: 'details'; slug: string }
  | { name: 'player'; slug: string; episodeId?: string }
  | { name: 'watchlist' }
  | { name: 'plans' }
  | { name: 'app' };
