'use client';

// غلاف التطبيق: التوجيه بالهاش، اللغة، الجلسة، التثبيت
import { useEffect, useRef, useState } from 'react';
import { Bookmark, Crown, Home, LayoutGrid, LogOut, Search, Settings, User } from 'lucide-react';
import { toast } from 'sonner';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { useApp, hashToView } from '@/lib/store';
import { getDict } from '@/lib/i18n';
import { api } from '@/lib/api-client';
import type { View } from '@/lib/types';
import { Header } from './header';
import { Footer } from './footer';
import { HomeView } from './home-view';
import { BrowseView } from './browse-view';
import { SearchView } from './search-view';
import { DetailsView } from './details-view';
import { PlayerView } from './player-view';
import { WatchlistView } from './watchlist-view';
import { PlansView } from './plans-view';
import { AuthDialog } from './auth-dialog';
import { nav } from './ui-bits';
import { LogoMark } from './ui-bits';

export function AppShell() {
  const view = useApp((s) => s.view);
  const setView = useApp((s) => s.setView);
  const setLang = useApp((s) => s.setLang);
  const refreshUser = useApp((s) => s.refreshUser);
  const setInstallEvent = useApp((s) => s.setInstallEvent);
  const [lastMain, setLastMain] = useState<View>({ name: 'home' });
  const isPlayer = view.name === 'player';
  const [accountOpen, setAccountOpen] = useState(false);
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    // اللغة المحفوظة
    try {
      const l = localStorage.getItem('shasha_lang');
      if (l === 'en' || l === 'ar') useApp.getState().setLang(l);
    } catch {}

    // موجّه الهاش
    const apply = () => {
      const v = hashToView(window.location.hash);
      if (v.name !== 'player') setLastMain(v);
      useApp.getState().setView(v);
    };
    apply();
    window.addEventListener('hashchange', apply);

    // جلسة المستخدم
    refreshUser();

    // تثبيت PWA
    const bip = (e: Event) => {
      e.preventDefault();
      useApp.getState().setInstallEvent(e);
    };
    window.addEventListener('beforeinstallprompt', bip);

    return () => {
      window.removeEventListener('hashchange', apply);
      window.removeEventListener('beforeinstallprompt', bip);
    };
  }, [setLang, refreshUser, setView, setInstallEvent]);

  // تمرير لأعلى عند تغيير الصفحة
  useEffect(() => {
    if (view.name !== 'player') window.scrollTo({ top: 0 });
  }, [view]);

  // قفل تمرير الخلفية أثناء المشغل
  useEffect(() => {
    document.body.style.overflow = isPlayer ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isPlayer]);

  const main = (() => {
    switch (lastMain.name) {
      case 'home':
        return <HomeView />;
      case 'browse':
        return (
          <BrowseView
            key={`${lastMain.type ?? ''}-${lastMain.genre ?? ''}-${lastMain.vip ?? ''}`}
            initialType={lastMain.type}
            initialGenre={lastMain.genre}
            initialVip={lastMain.vip}
          />
        );
      case 'search':
        return <SearchView key={lastMain.q ?? ''} initialQ={lastMain.q} />;
      case 'details':
        return <DetailsView key={lastMain.slug} slug={lastMain.slug} />;
      case 'watchlist':
        return <WatchlistView />;
      case 'plans':
        return <PlansView />;
      default:
        return <HomeView />;
    }
  })();

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="w-full flex-1 pb-24 md:pb-0">{main}</main>
      <Footer />
      <MobileTabBar onAccount={() => setAccountOpen(true)} />
      <AccountDrawer open={accountOpen} onOpenChange={setAccountOpen} />
      {isPlayer && (
        <PlayerView
          slug={(view as any).slug}
          episodeId={(view as any).episodeId ?? null}
          onClose={() => nav({ name: 'details', slug: (view as any).slug })}
        />
      )}
      <AuthDialog />
      <SwRegister />
    </div>
  );
}

// ===== شريط التبويب السفلي (جوال) =====
function MobileTabBar({ onAccount }: { onAccount: () => void }) {
  const lang = useApp((s) => s.lang);
  const view = useApp((s) => s.view);
  const T = getDict(lang);
  const user = useApp((s) => s.user);

  const items = [
    { key: 'home', label: T.navHome, icon: Home, active: view.name === 'home', action: () => nav({ name: 'home' }) },
    {
      key: 'browse',
      label: T.browse,
      icon: LayoutGrid,
      active: view.name === 'browse',
      action: () => nav({ name: 'browse' }),
    },
    {
      key: 'search',
      label: T.search,
      icon: Search,
      active: view.name === 'search',
      action: () => nav({ name: 'search' }),
    },
    {
      key: 'list',
      label: T.navMyList,
      icon: Bookmark,
      active: view.name === 'watchlist' || view.name === 'details',
      action: () => nav({ name: 'watchlist' }),
    },
    { key: 'account', label: T.account, icon: User, active: false, action: onAccount },
  ];

  return (
    <nav
      className="glass fixed bottom-0 inset-x-0 z-40 flex border-t border-white/10 pb-[env(safe-area-inset-bottom)] md:hidden"
      aria-label="mobile"
    >
      {items.map((it) => (
        <button
          key={it.key}
          onClick={it.action}
          className={`flex flex-1 flex-col items-center gap-1 py-2.5 transition-colors ${
            it.active ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <it.icon className="size-5" />
          <span className="text-[10px] font-bold">{it.label}</span>
        </button>
      ))}
    </nav>
  );
}

// ===== درج الحساب (جوال) =====
function AccountDrawer({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const lang = useApp((s) => s.lang);
  const user = useApp((s) => s.user);
  const openAuth = useApp((s) => s.openAuth);
  const refreshUser = useApp((s) => s.refreshUser);
  const setLang = useApp((s) => s.setLang);
  const installEvent = useApp((s) => s.installEvent);
  const T = getDict(lang);

  const logout = async () => {
    await api('/api/auth/logout', { method: 'POST' }).catch(() => {});
    await refreshUser();
    onOpenChange(false);
    toast.success(T.logoutSuccess);
    nav({ name: 'home' });
  };

  const doInstall = async () => {
    const ev: any = installEvent;
    if (!ev) return;
    ev.prompt?.();
    useApp.getState().setInstallEvent(null);
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="mx-auto max-w-md">
        <DrawerHeader className="pb-2">
          <DrawerTitle className="flex items-center gap-2">
            <LogoMark size={28} />
            {T.account}
          </DrawerTitle>
        </DrawerHeader>
        <div className="space-y-3 px-4 pb-8">
          {user ? (
            <>
              <div className="flex items-center gap-3 rounded-2xl bg-card p-4 ring-1 ring-white/5">
                <span
                  className="grid size-12 place-items-center rounded-full text-lg font-black text-white"
                  style={{ backgroundColor: user.avatarColor }}
                >
                  {user.name.trim().charAt(0)}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-black">{user.name}</p>
                  <p className="truncate text-xs text-muted-foreground" dir="ltr">
                    {user.email}
                  </p>
                </div>
                {user.isVip && <Crown className="size-6 shrink-0 text-vip" />}
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="secondary"
                  onClick={() => {
                    onOpenChange(false);
                    nav({ name: 'watchlist' });
                  }}
                  className="rounded-xl font-bold"
                >
                  <Bookmark className="size-4" />
                  {T.navMyList}
                </Button>
                <Button
                  onClick={() => {
                    onOpenChange(false);
                    nav({ name: 'plans' });
                  }}
                  className="rounded-xl bg-vip font-black text-vip-foreground hover:bg-vip/90"
                >
                  <Crown className="size-4" />
                  {T.vipTitle}
                </Button>
              </div>

              <Button
                variant="outline"
                onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')}
                className="w-full rounded-xl font-bold"
              >
                <Settings className="size-4" />
                {T.language}: {lang === 'ar' ? 'العربية' : 'English'}
              </Button>

              {installEvent && (
                <Button
                  variant="outline"
                  onClick={doInstall}
                  className="w-full rounded-xl border-primary/40 font-bold text-primary"
                >
                  {T.installApp}
                </Button>
              )}

              <Button
                variant="outline"
                onClick={logout}
                className="w-full rounded-xl border-destructive/40 font-bold text-destructive hover:bg-destructive/10 hover:text-destructive"
              >
                <LogOut className="size-4" />
                {T.logout}
              </Button>
            </>
          ) : (
            <Button
              onClick={() => {
                onOpenChange(false);
                openAuth('login');
              }}
              className="h-12 w-full rounded-xl bg-primary text-base font-black text-primary-foreground hover:bg-primary/90"
            >
              <User className="size-5" />
              {T.login}
            </Button>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
}

// ===== تسجيل عامل الخدمة =====
function SwRegister() {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;
    const onLoad = () => {
      navigator.serviceWorker.register('/sw.js').catch(() => {});
    };
    if (document.readyState === 'complete') onLoad();
    else {
      window.addEventListener('load', onLoad);
      return () => window.removeEventListener('load', onLoad);
    }
  }, []);
  return null;
}
