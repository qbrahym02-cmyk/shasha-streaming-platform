'use client';

// التذييل
import { Download, Smartphone } from 'lucide-react';
import { useApp } from '@/lib/store';
import { getDict } from '@/lib/i18n';
import { BRAND, APP_DOWNLOAD } from '@/lib/config';
import { Button } from '@/components/ui/button';
import { LogoMark, nav } from './ui-bits';
import { DownloadButton } from './app-landing';

export function Footer() {
  const lang = useApp((s) => s.lang);
  const installEvent = useApp((s) => s.installEvent);
  const T = getDict(lang);

  const doInstall = async () => {
    const ev: any = installEvent;
    if (!ev) return;
    ev.prompt?.();
    useApp.getState().setInstallEvent(null);
  };

  return (
    <footer className="mt-14 border-t border-white/5 bg-[#060a08]">
      {/* شريط تحميل التطبيق */}
      <div className="border-b border-white/5 bg-gradient-to-l from-primary/5 via-transparent to-primary/5">
        <div className="mx-auto flex max-w-[1500px] flex-col items-center justify-between gap-4 px-4 py-6 sm:flex-row md:px-8">
          <div className="flex items-center gap-3">
            <span className="grid size-11 place-items-center rounded-2xl bg-primary/15 ring-1 ring-primary/25">
              <Smartphone className="size-5 text-primary" />
            </span>
            <div className="leading-tight">
              <p className="font-black">{T.appLandingBadge}</p>
              <p className="text-xs text-muted-foreground" dir="auto">
                {APP_DOWNLOAD.sizeMb} MB · {T.appDevicesAndroidDesc}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <DownloadButton size="md" className="sm:w-auto" />
            {installEvent && (
              <Button
                size="sm"
                variant="outline"
                onClick={doInstall}
                className="h-12 rounded-2xl border-white/15 font-bold"
              >
                <Download className="size-4" />
                {T.installApp}
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="mx-auto grid max-w-[1500px] gap-10 px-4 py-12 md:grid-cols-4 md:px-8">
        <div className="space-y-4">
          <div className="flex items-center gap-2.5">
            <LogoMark size={40} />
            <div className="leading-none">
              <p className="text-xl font-black">{lang === 'ar' ? BRAND.nameAr : BRAND.nameEn}</p>
              <p className="mt-1 text-[10px] font-bold tracking-[0.35em] text-muted-foreground">SHASHA</p>
            </div>
          </div>
          <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">{T.footerAboutText}</p>
        </div>

        <div>
          <p className="mb-3 font-extrabold">{T.footerBrowse}</p>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>
              <button className="hover:text-primary" onClick={() => nav({ name: 'browse', type: 'MOVIE' })}>
                {T.navMovies}
              </button>
            </li>
            <li>
              <button className="hover:text-primary" onClick={() => nav({ name: 'browse', type: 'SERIES' })}>
                {T.navSeries}
              </button>
            </li>
            <li>
              <button className="hover:text-primary" onClick={() => nav({ name: 'browse', genre: 'anime' })}>
                {T.navAnime}
              </button>
            </li>
            <li>
              <button className="hover:text-primary" onClick={() => nav({ name: 'watchlist' })}>
                {T.navMyList}
              </button>
            </li>
            <li>
              <button className="hover:text-primary" onClick={() => nav({ name: 'plans' })}>
                {T.vipTitle}
              </button>
            </li>
          </ul>
        </div>

        <div>
          <p className="mb-3 font-extrabold">{T.footerSupport}</p>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>
              <button className="hover:text-primary" onClick={() => nav({ name: 'app' })}>
                {T.navApp}
              </button>
            </li>
            <li>{T.faq}</li>
            <li>{T.contact}</li>
            <li>{T.terms}</li>
            <li>{T.privacy}</li>
          </ul>
        </div>

        <div>
          <p className="mb-3 font-extrabold">{T.footerAbout}</p>
          <p className="text-xs leading-relaxed text-muted-foreground">{T.footerDisclaimer}</p>
        </div>
      </div>

      <div className="border-t border-white/5 py-5 pb-24 text-center text-xs text-muted-foreground md:pb-5">
        © {new Date().getFullYear()} {BRAND.nameEn} — {T.footerRights}
      </div>
    </footer>
  );
}
