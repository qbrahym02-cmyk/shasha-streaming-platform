'use client';

// مشغل الفيديو — HLS متكيف + جودة + ترجمة + صوت + سرعة + استكمال + التالي تلقائياً
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  AlertTriangle,
  Check,
  Crown,
  Gauge,
  Languages,
  Loader2,
  Maximize,
  Minimize,
  Pause,
  PictureInPicture2,
  Play,
  RotateCcw,
  Settings2,
  SkipBack,
  SkipForward,
  User,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { api, fmtTime } from '@/lib/api-client';
import { useApp, viewToHash } from '@/lib/store';
import { getDict } from '@/lib/i18n';
import type { PlaySource } from '@/lib/types';
import { VipChip } from './ui-bits';

type Status = 'loading' | 'ready' | 'gate_auth' | 'gate_vip' | 'unavailable' | 'error';

export function PlayerView({
  slug,
  episodeId,
  onClose,
}: {
  slug: string;
  episodeId: string | null;
  onClose: () => void;
}) {
  const lang = useApp((s) => s.lang);
  const user = useApp((s) => s.user);
  const openAuth = useApp((s) => s.openAuth);
  const T = getDict(lang);

  const [status, setStatus] = useState<Status>('loading');
  const [data, setData] = useState<PlaySource | null>(null);
  const [activeEp, setActiveEp] = useState<string | null>(episodeId);
  const [usingFallback, setUsingFallback] = useState(false);
  const [retryKey, setRetryKey] = useState(0);

  const [playing, setPlaying] = useState(false);
  const [waiting, setWaiting] = useState(true);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);
  const [buffered, setBuffered] = useState(0);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [levels, setLevels] = useState<{ i: number; label: string }[]>([]);
  const [level, setLevel] = useState(-1);
  const [autoLabel, setAutoLabel] = useState('');
  const [subs, setSubs] = useState<{ i: number; label: string }[]>([]);
  const [sub, setSub] = useState(-1);
  const [audios, setAudios] = useState<{ i: number; label: string }[]>([]);
  const [audio, setAudio] = useState(-1);
  const [speed, setSpeed] = useState(1);
  const [controls, setControls] = useState(true);
  const [fullscreen, setFullscreen] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [seekHover, setSeekHover] = useState(false);
  const [ended, setEnded] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const idleTimer = useRef<any>(null);
  const stateRef = useRef({ playing, current, duration, user, slug, activeEp });
  stateRef.current = { playing, current, duration, user, slug, activeEp };

  const title = data ? (lang === 'ar' ? data.titleAr : data.titleEn) : '';
  const epName = data ? (lang === 'ar' ? data.episodeNameAr : data.episodeNameEn) : null;

  // ===== جلب المصدر مع التحقق من الصلاحيات =====
  useEffect(() => {
    let cancelled = false;
    setStatus('loading');
    setData(null);
    setEnded(false);
    setCountdown(null);
    (async () => {
      try {
        const d = await api<PlaySource>(`/api/titles/${slug}/play${activeEp ? `?e=${activeEp}` : ''}`);
        if (!cancelled) {
          setData(d);
          setStatus('ready');
        }
      } catch (e: any) {
        if (cancelled) return;
        if (e?.code === 'vip_required') setStatus('gate_vip');
        else if (e?.code === 'auth_required') setStatus('gate_auth');
        else if (e?.code === 'not_available' || e?.code === 'no_source') setStatus('unavailable');
        else setStatus('error');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [slug, activeEp, retryKey]);

  // ===== حفظ التقدم =====
  const saveProgress = useCallback((pos: number, dur: number) => {
    const s = stateRef.current;
    if (!dur || dur < 5) return;
    api('/api/progress', {
      method: 'POST',
      body: JSON.stringify({
        slug: s.slug,
        episodeId: s.activeEp,
        positionSec: Math.floor(pos),
        durationSec: Math.floor(dur),
      }),
    }).catch(() => {});
  }, []);

  // ===== إعداد المشغل =====
  useEffect(() => {
    if (status !== 'ready' || !data) return;
    const video = videoRef.current;
    if (!video) return;

    let destroyed = false;
    let hls: any = null;
    const url = usingFallback && data.fallbackUrl ? data.fallbackUrl : data.sourceUrl;
    const isHls = /\.m3u8(\?|$)/i.test(url);

    setWaiting(true);
    setCurrent(0);
    setDuration(0);

    (async () => {
      if (isHls) {
        const Hls = (await import('hls.js')).default;
        if (destroyed) return;
        if (Hls.isSupported()) {
          hls = new Hls({ enableWorker: true });
          hlsRef.current = hls;
          hls.loadSource(url);
          hls.attachMedia(video);
          hls.on(Hls.Events.MANIFEST_PARSED, () => {
            if (destroyed) return;
            setLevels(
              (hls.levels || [])
                .map((l: any, i: number) => ({ i, label: l.height ? `${l.height}p` : `${Math.round((l.bitrate || 0) / 1000)}k` }))
            );
            const st = (hls.subtitleTracks || []).map((s: any, i: number) => ({ i, label: s.name || s.lang || `#${i + 1}` }));
            setSubs(st);
            const at = (hls.audioTracks || []).map((a: any, i: number) => ({ i, label: a.name || a.lang || `#${i + 1}` }));
            setAudios(at);
            video.play().catch(() => {});
          });
          hls.on(Hls.Events.LEVEL_SWITCHED, (_e: any, d: any) => {
            const l = hls.levels?.[d.level];
            setAutoLabel(l?.height ? `${l.height}p` : '');
          });
          hls.on(Hls.Events.AUDIO_TRACK_SWITCHED, (_e: any, d: any) => setAudio(d.id));
          hls.on(Hls.Events.ERROR, (_e: any, err: any) => {
            if (err?.fatal) {
              if (data.fallbackUrl && !usingFallback) {
                setUsingFallback(true);
              } else {
                setStatus('error');
              }
            }
          });
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = url;
          video.play().catch(() => {});
        } else if (data.fallbackUrl) {
          setUsingFallback(true);
        } else {
          setStatus('error');
        }
      } else {
        video.src = url;
        video.play().catch(() => {});
      }
    })();

    return () => {
      destroyed = true;
      if (hls) {
        hls.destroy();
        hlsRef.current = null;
      }
      video.pause();
      video.removeAttribute('src');
      try {
        video.load();
      } catch {}
    };
  }, [status, data, usingFallback]);

  // ===== أحداث الفيديو =====
  useEffect(() => {
    const video = videoRef.current;
    if (!video || status !== 'ready') return;

    const updateBuffered = () => {
      try {
        if (video.buffered.length > 0) {
          setBuffered(video.buffered.end(video.buffered.length - 1));
        }
      } catch {}
    };

    const onTime = () => {
      setCurrent(video.currentTime);
      updateBuffered();
    };
    const onDur = () => setDuration(video.duration || 0);
    const onPlay = () => {
      setPlaying(true);
      setEnded(false);
    };
    const onPause = () => {
      setPlaying(false);
      saveProgress(video.currentTime, video.duration || 0);
    };
    const onWaiting = () => setWaiting(true);
    const onPlaying = () => setWaiting(false);
    const onCanPlay = () => setWaiting(false);
    const onVol = () => {
      setVolume(video.volume);
      setMuted(video.muted);
    };
    const onLoaded = () => {
      setDuration(video.duration || 0);
      if (data?.resumeAt && video.currentTime === 0) {
        try {
          video.currentTime = data.resumeAt;
        } catch {}
      }
      // مسارات ترجمة أصلية (سفاري)
      if (subs.length === 0 && video.textTracks.length > 0) {
        const st: { i: number; label: string }[] = [];
        for (let k = 0; k < video.textTracks.length; k++) {
          const t = video.textTracks[k];
          if (t.kind === 'subtitles' || t.kind === 'captions') {
            st.push({ i: k, label: t.label || t.language || `#${k + 1}` });
          }
        }
        if (st.length) setSubs(st);
      }
    };
    const onEnded = () => {
      setPlaying(false);
      setEnded(true);
      saveProgress(video.duration || 0, video.duration || 0);
      if (data?.nextEpisodeId) setCountdown(5);
    };

    video.addEventListener('timeupdate', onTime);
    video.addEventListener('progress', updateBuffered);
    video.addEventListener('durationchange', onDur);
    video.addEventListener('loadedmetadata', onLoaded);
    video.addEventListener('play', onPlay);
    video.addEventListener('pause', onPause);
    video.addEventListener('waiting', onWaiting);
    video.addEventListener('playing', onPlaying);
    video.addEventListener('canplay', onCanPlay);
    video.addEventListener('volumechange', onVol);
    video.addEventListener('ended', onEnded);
    return () => {
      video.removeEventListener('timeupdate', onTime);
      video.removeEventListener('progress', updateBuffered);
      video.removeEventListener('durationchange', onDur);
      video.removeEventListener('loadedmetadata', onLoaded);
      video.removeEventListener('play', onPlay);
      video.removeEventListener('pause', onPause);
      video.removeEventListener('waiting', onWaiting);
      video.removeEventListener('playing', onPlaying);
      video.removeEventListener('canplay', onCanPlay);
      video.removeEventListener('volumechange', onVol);
      video.removeEventListener('ended', onEnded);
    };
  }, [status, data?.resumeAt, data?.nextEpisodeId, subs.length, saveProgress]);

  // حفظ دوري + عند الخروج
  useEffect(() => {
    const iv = setInterval(() => {
      const s = stateRef.current;
      const video = videoRef.current;
      if (s.playing && video) saveProgress(video.currentTime, video.duration || 0);
    }, 8000);
    const onHide = () => {
      const video = videoRef.current;
      if (video) saveProgress(video.currentTime, video.duration || 0);
    };
    document.addEventListener('visibilitychange', onHide);
    return () => {
      clearInterval(iv);
      document.removeEventListener('visibilitychange', onHide);
      onHide();
    };
  }, [saveProgress]);

  // ===== العد التنازلي للحلقة التالية =====
  useEffect(() => {
    if (countdown === null) return;
    if (countdown <= 0) {
      goNext();
      return;
    }
    const t = setTimeout(() => setCountdown((c) => (c === null ? null : c - 1)), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  const goNext = () => {
    if (!data?.nextEpisodeId) return;
    setCountdown(null);
    setActiveEp(data.nextEpisodeId);
    window.history.replaceState(null, '', viewToHash({ name: 'player', slug, episodeId: data.nextEpisodeId }));
  };

  // ===== عرض/إخفاء الأدوات =====
  const wake = useCallback(() => {
    setControls(true);
    clearTimeout(idleTimer.current);
    if (stateRef.current.playing) {
      idleTimer.current = setTimeout(() => setControls(false), 3200);
    }
  }, []);

  useEffect(() => {
    if (!playing) {
      clearTimeout(idleTimer.current);
      setControls(true);
    } else {
      wake();
    }
  }, [playing, wake]);

  // ===== ملء الشاشة =====
  useEffect(() => {
    const onFs = () => setFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', onFs);
    return () => document.removeEventListener('fullscreenchange', onFs);
  }, []);

  const toggleFullscreen = async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await containerRef.current?.requestFullscreen();
    } catch {}
  };

  // ===== أوامر المشغل =====
  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) v.play().catch(() => {});
    else v.pause();
  };

  const seekBy = (d: number) => {
    const v = videoRef.current;
    if (!v) return;
    v.currentTime = Math.max(0, Math.min((v.duration || 0) - 0.5, v.currentTime + d));
  };

  const setVol = (val: number) => {
    const v = videoRef.current;
    if (!v) return;
    v.volume = val;
    v.muted = val === 0;
  };

  const toggleMute = () => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
  };

  const pickQuality = (i: number) => {
    setLevel(i);
    if (hlsRef.current) hlsRef.current.currentLevel = i;
  };

  const pickSub = (i: number) => {
    setSub(i);
    const v = videoRef.current;
    if (hlsRef.current?.subtitleTracks?.length) {
      hlsRef.current.subtitleTrack = i;
      return;
    }
    if (v) {
      for (let k = 0; k < v.textTracks.length; k++) {
        v.textTracks[k].mode = k === i ? 'showing' : 'disabled';
      }
    }
  };

  const pickAudio = (i: number) => {
    setAudio(i);
    if (hlsRef.current) hlsRef.current.audioTrack = i;
  };

  const setRate = (r: number) => {
    setSpeed(r);
    if (videoRef.current) videoRef.current.playbackRate = r;
  };

  const togglePip = async () => {
    const v = videoRef.current as any;
    if (!v) return;
    try {
      if (document.pictureInPictureElement) await (document as any).exitPictureInPicture();
      else await v.requestPictureInPicture?.();
    } catch {}
  };

  // ===== اختصارات لوحة المفاتيح =====
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.tagName === 'INPUT') return;
      switch (e.key) {
        case ' ':
        case 'k':
          e.preventDefault();
          togglePlay();
          break;
        case 'ArrowRight':
          e.preventDefault();
          seekBy(10);
          break;
        case 'ArrowLeft':
          e.preventDefault();
          seekBy(-10);
          break;
        case 'ArrowUp':
          e.preventDefault();
          setVol(Math.min(1, (videoRef.current?.volume ?? 1) + 0.1));
          break;
        case 'ArrowDown':
          e.preventDefault();
          setVol(Math.max(0, (videoRef.current?.volume ?? 0) - 0.1));
          break;
        case 'f':
          toggleFullscreen();
          break;
        case 'm':
          toggleMute();
          break;
      }
      wake();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [wake]);

  // ===== الواجهات الشرطية =====
  if (status === 'loading') {
    return (
      <div className="fixed inset-0 z-[100] grid place-items-center bg-black">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="size-14 animate-spin text-primary" />
          <p className="text-sm font-bold text-white/80">{T.loadingStream}</p>
        </div>
      </div>
    );
  }

  if (status === 'gate_vip' || status === 'gate_auth') {
    return (
      <div className="fixed inset-0 z-[100] grid place-items-center bg-black px-6">
        <div className="max-w-sm text-center">
          <div className="mx-auto mb-4 grid size-24 place-items-center rounded-full bg-vip/15 ring-2 ring-vip/40">
            {status === 'gate_vip' ? (
              <Crown className="size-12 text-vip" />
            ) : (
              <User className="size-12 text-primary" />
            )}
          </div>
          <h2 className="text-2xl font-black text-white">
            {status === 'gate_vip' ? T.vipLockTitle : T.loginToWatch}
          </h2>
          <p className="mt-2 text-sm text-white/70">{status === 'gate_vip' ? T.vipLockDesc : T.authSubtitle}</p>
          <div className="mt-6 flex flex-col gap-2">
            {status === 'gate_vip' ? (
              <Button
                onClick={() => {
                  onClose();
                  window.location.hash = '#/vip';
                }}
                className="h-12 rounded-xl bg-vip text-base font-black text-vip-foreground hover:bg-vip/90"
              >
                <Crown className="size-5" />
                {T.vipCta}
              </Button>
            ) : (
              <Button
                onClick={() => {
                  onClose();
                  openAuth('login');
                }}
                className="h-12 rounded-xl bg-primary text-base font-black text-primary-foreground hover:bg-primary/90"
              >
                {T.login}
              </Button>
            )}
            <Button variant="ghost" onClick={onClose} className="rounded-xl font-bold text-white hover:bg-white/10">
              {T.backToBrowse}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (status === 'unavailable' || status === 'error') {
    return (
      <div className="fixed inset-0 z-[100] grid place-items-center bg-black px-6">
        <div className="max-w-sm text-center">
          <AlertTriangle className="mx-auto mb-4 size-16 text-amber-400" />
          <h2 className="text-2xl font-black text-white">
            {status === 'unavailable' ? T.comingSoon : T.streamError}
          </h2>
          <div className="mt-6 flex flex-col gap-2">
            {status === 'error' && (
              <Button
                onClick={() => {
                  setUsingFallback(false);
                  setRetryKey((k) => k + 1);
                }}
                className="h-12 rounded-xl bg-primary text-base font-black text-primary-foreground hover:bg-primary/90"
              >
                <RotateCcw className="size-5" />
                {T.retry}
              </Button>
            )}
            <Button variant="ghost" onClick={onClose} className="rounded-xl font-bold text-white hover:bg-white/10">
              {T.backToBrowse}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ===== المشغل =====
  const pct = duration > 0 ? (current / duration) * 100 : 0;
  const bufPct = duration > 0 ? (buffered / duration) * 100 : 0;
  const currentEpObj = data?.episodes.find((e) => e.id === activeEp);
  const isPremiumPlaying = currentEpObj?.isPremium ?? false;

  return (
    <div
      ref={containerRef}
      dir="rtl"
      className="fixed inset-0 z-[100] select-none bg-black"
      onMouseMove={wake}
      onTouchStart={wake}
    >
      <video
        ref={videoRef}
        playsInline
        className="absolute inset-0 h-full w-full object-contain"
        onClick={togglePlay}
        onDoubleClick={toggleFullscreen}
      />

      {/* الشريط العلوي */}
      <div
        className={`absolute inset-x-0 top-0 bg-gradient-to-b from-black/85 to-transparent p-4 transition-opacity duration-300 md:p-5 ${
          controls ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
      >
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            aria-label={T.close}
            className="grid size-11 shrink-0 place-items-center rounded-full bg-black/45 text-white ring-1 ring-white/15 backdrop-blur-sm transition hover:bg-black/70"
          >
            <X className="size-6" />
          </button>
          <div className="min-w-0 flex-1">
            <p className="truncate text-base font-extrabold text-white md:text-lg">{title}</p>
            {epName && (
              <p className="truncate text-xs font-semibold text-white/70 md:text-sm">
                {T.episode} {currentEpObj?.number} — {epName}
              </p>
            )}
          </div>
          {isPremiumPlaying && <VipChip className="px-2 py-1" />}
          {data?.nextEpisodeId && (
            <Button
              size="sm"
              onClick={goNext}
              className="rounded-xl bg-white/15 font-bold text-white backdrop-blur-sm hover:bg-white/25"
            >
              <SkipForward className="size-4 rtl:rotate-180" />
              <span className="hidden sm:inline">{T.nextEpisode}</span>
            </Button>
          )}
        </div>
      </div>

      {/* المنتصف: تحميل / تشغيل */}
      {waiting && (
        <div className="pointer-events-none absolute inset-0 grid place-items-center">
          <Loader2 className="size-16 animate-spin text-primary drop-shadow-xl" />
        </div>
      )}
      {!playing && !waiting && !ended && (
        <button
          onClick={togglePlay}
          aria-label="play"
          className="absolute inset-0 grid place-items-center"
        >
          <span className="grid size-20 place-items-center rounded-full bg-primary/95 shadow-2xl shadow-primary/50 transition hover:scale-105">
            <Play className="size-10 fill-primary-foreground text-primary-foreground" />
          </span>
        </button>
      )}

      {/* نهاية الحلقة: التالي */}
      {ended && countdown !== null && data?.nextEpisodeId && (
        <div className="absolute inset-0 grid place-items-center bg-black/75 px-6">
          <div className="glass w-full max-w-sm rounded-3xl p-6 text-center ring-1 ring-white/10">
            <p className="text-sm font-bold text-white/70">{T.nextEpisode}</p>
            <p className="mt-1 truncate text-xl font-black text-white">
              {data.episodes.find((e) => e.id === data.nextEpisodeId)?.[lang === 'ar' ? 'nameAr' : 'nameEn'] ??
                data.nextEpisodeId}
            </p>
            <div className="relative mx-auto my-5 grid size-20 place-items-center">
              <svg className="absolute inset-0 -rotate-90" viewBox="0 0 80 80">
                <circle cx="40" cy="40" r="34" stroke="rgba(255,255,255,.15)" strokeWidth="6" fill="none" />
                <circle
                  cx="40"
                  cy="40"
                  r="34"
                  stroke="#00d26a"
                  strokeWidth="6"
                  fill="none"
                  strokeLinecap="round"
                  strokeDasharray={2 * Math.PI * 34}
                  strokeDashoffset={2 * Math.PI * 34 * (1 - countdown / 5)}
                  className="transition-all duration-1000"
                />
              </svg>
              <span className="text-2xl font-black text-white">{countdown}</span>
            </div>
            <div className="flex gap-2">
              <Button onClick={goNext} className="flex-1 rounded-xl bg-primary font-black text-primary-foreground hover:bg-primary/90">
                <Play className="size-4 fill-current" />
                {T.playNext}
              </Button>
              <Button variant="ghost" onClick={() => setCountdown(null)} className="rounded-xl font-bold text-white hover:bg-white/10">
                {T.cancel}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* نهاية بلا تالي: إعادة */}
      {ended && countdown === null && (
        <div className="absolute inset-0 grid place-items-center bg-black/70">
          <Button
            onClick={() => {
              const v = videoRef.current;
              if (v) {
                v.currentTime = 0;
                v.play().catch(() => {});
              }
            }}
            className="h-14 rounded-2xl bg-primary px-8 text-lg font-black text-primary-foreground hover:bg-primary/90"
          >
            <RotateCcw className="size-6" />
            {T.retry}
          </Button>
        </div>
      )}

      {/* الشريط السفلي */}
      <div
        className={`absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent px-4 pb-4 pt-12 transition-opacity duration-300 md:px-6 ${
          controls ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
      >
        {/* شريط التقدم */}
        <div
          className="group/seek relative -mx-1 cursor-pointer px-1 py-2"
          onMouseEnter={() => setSeekHover(true)}
          onMouseLeave={() => setSeekHover(false)}
        >
          <div className={`relative rounded-full transition-all ${seekHover ? 'h-2' : 'h-1'}`}>
            <div className="absolute inset-0 rounded-full bg-white/25" />
            <div className="absolute inset-y-0 start-0 rounded-full bg-white/35" style={{ width: `${bufPct}%` }} />
            <div className="absolute inset-y-0 start-0 rounded-full bg-primary" style={{ width: `${pct}%` }} />
            <span
              className={`absolute top-1/2 -translate-y-1/2 start-0 -translate-x-1/2 rtl:translate-x-1/2 rounded-full bg-primary shadow-lg shadow-primary/60 transition-all ${
                seekHover ? 'size-4' : 'size-0'
              }`}
              style={{ insetInlineStart: `${pct}%` }}
            />
          </div>
          <input
            type="range"
            min={0}
            max={duration || 0}
            step={0.5}
            value={current}
            onChange={(e) => {
              const v = videoRef.current;
              if (v) v.currentTime = Number(e.target.value);
            }}
            className="player-range absolute inset-0 h-full w-full opacity-0"
            aria-label="seek"
          />
        </div>

        {/* الأزرار */}
        <div className="flex items-center gap-1 md:gap-2">
          <button onClick={togglePlay} aria-label="play-pause" className="grid size-11 place-items-center rounded-full text-white transition hover:bg-white/15">
            {playing ? <Pause className="size-7 fill-current" /> : <Play className="size-7 fill-current" />}
          </button>

          <button onClick={() => seekBy(-10)} aria-label="back-10" className="relative grid size-10 place-items-center rounded-full text-white transition hover:bg-white/15">
            <SkipBack className="size-5 rtl:rotate-180" />
            <span className="absolute text-[8px] font-black">10</span>
          </button>
          <button onClick={() => seekBy(10)} aria-label="forward-10" className="relative grid size-10 place-items-center rounded-full text-white transition hover:bg-white/15">
            <SkipForward className="size-5 rtl:rotate-180" />
            <span className="absolute text-[8px] font-black">10</span>
          </button>

          {/* الصوت */}
          <div className="group/vol flex items-center">
            <button onClick={toggleMute} aria-label="mute" className="grid size-10 place-items-center rounded-full text-white transition hover:bg-white/15">
              {muted || volume === 0 ? <VolumeX className="size-5" /> : <Volume2 className="size-5" />}
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={muted ? 0 : volume}
              onChange={(e) => setVol(Number(e.target.value))}
              className="vol-range w-0 opacity-0 transition-all duration-300 group-hover/vol:w-20 group-hover/vol:opacity-100"
              aria-label="volume"
            />
          </div>

          <span className="ms-1 select-none text-xs font-bold tabular-nums text-white/90 md:text-sm">
            {fmtTime(current)} / {fmtTime(duration)}
          </span>

          <div className="ms-auto flex items-center gap-0.5 md:gap-1">
            {/* السرعة */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button aria-label={T.speed} className="grid size-10 place-items-center rounded-full text-white transition hover:bg-white/15">
                  <Gauge className="size-5" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>{T.speed}</DropdownMenuLabel>
                {[0.5, 0.75, 1, 1.25, 1.5, 2].map((r) => (
                  <DropdownMenuItem key={r} onClick={() => setRate(r)} className="gap-2 font-bold">
                    {speed === r && <Check className="size-4 text-primary" />}
                    {r === 1 ? `${T.normal} (1x)` : `${r}x`}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* الترجمة */}
            {subs.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button aria-label={T.subtitles} className="grid size-10 place-items-center rounded-full text-white transition hover:bg-white/15">
                    <Languages className="size-5" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>{T.subtitles}</DropdownMenuLabel>
                  <DropdownMenuItem onClick={() => pickSub(-1)} className="gap-2 font-bold">
                    {sub === -1 && <Check className="size-4 text-primary" />}
                    {T.off}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  {subs.map((s) => (
                    <DropdownMenuItem key={s.i} onClick={() => pickSub(s.i)} className="gap-2 font-bold">
                      {sub === s.i && <Check className="size-4 text-primary" />}
                      {s.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {/* الصوت */}
            {audios.length > 1 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button aria-label="audio" className="grid size-10 place-items-center rounded-full text-white transition hover:bg-white/15">
                    <Settings2 className="size-5" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Audio</DropdownMenuLabel>
                  {audios.map((a) => (
                    <DropdownMenuItem key={a.i} onClick={() => pickAudio(a.i)} className="gap-2 font-bold">
                      {audio === a.i && <Check className="size-4 text-primary" />}
                      {a.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {/* الجودة */}
            {levels.length > 1 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button aria-label={T.quality} className="flex h-10 items-center gap-1.5 rounded-full px-2.5 text-white transition hover:bg-white/15">
                    <Settings2 className="size-5" />
                    <span className="hidden text-xs font-black sm:inline">
                      {level === -1 ? (autoLabel ? `${T.auto} ${autoLabel}` : T.auto) : levels.find((l) => l.i === level)?.label}
                    </span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>{T.quality}</DropdownMenuLabel>
                  <DropdownMenuItem onClick={() => pickQuality(-1)} className="gap-2 font-bold">
                    {level === -1 && <Check className="size-4 text-primary" />}
                    {T.auto} {autoLabel && <span className="text-muted-foreground">({autoLabel})</span>}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  {levels.map((l) => (
                    <DropdownMenuItem key={l.i} onClick={() => pickQuality(l.i)} className="gap-2 font-bold">
                      {level === l.i && <Check className="size-4 text-primary" />}
                      {l.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {/* PiP */}
            <button
              onClick={togglePip}
              aria-label="pip"
              className="hidden size-10 place-items-center rounded-full text-white transition hover:bg-white/15 md:grid"
            >
              <PictureInPicture2 className="size-5" />
            </button>

            {/* ملء الشاشة */}
            <button onClick={toggleFullscreen} aria-label="fullscreen" className="grid size-10 place-items-center rounded-full text-white transition hover:bg-white/15">
              {fullscreen ? <Minimize className="size-5" /> : <Maximize className="size-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* إشعار استئناف */}
      {data?.resumeAt > 10 && current < 2 && !ended && (
        <div className="absolute top-20 start-1/2 -translate-x-1/2 rounded-full bg-black/70 px-4 py-2 text-xs font-bold text-white backdrop-blur-sm rtl:translate-x-1/2">
          {T.resumeFrom} {fmtTime(data.resumeAt)}
        </div>
      )}
    </div>
  );
}
