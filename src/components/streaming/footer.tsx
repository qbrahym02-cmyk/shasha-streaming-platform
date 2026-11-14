'use client';

// التذييل
import { Download } from 'lucide-react';
import { useApp } from '@/lib/store';
import { getDict } from '@/lib/i18n';
import { BRAND } from '@/lib/config';
import { Button } from '@/components/ui/button';
import { LogoMark, nav } from './ui-bits';

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
          {installEvent && (
            <Button
              size="sm"
              onClick={doInstall}
              className="rounded-xl bg-primary font-bold text-primary-foreground hover:bg-primary/90"
            >
              <Download className="size-4" />
              {T.installApp}
            </Button>
          )}
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
