'use client';

// رأس الصفحة + قائمة المستخدم + شريط التبويب السفلي للجوال
import { useEffect, useRef, useState } from 'react';
import {
  Bookmark,
  Crown,
  Download,
  Languages,
  LogOut,
  Search,
  Settings,
  User,
  X,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useApp } from '@/lib/store';
import { getDict } from '@/lib/i18n';
import { api } from '@/lib/api-client';
import { nav } from './ui-bits';
import { BrandLogo, useWatchlistCount } from './ui-bits';

export function Header() {
  const lang = useApp((s) => s.lang);
  const setLang = useApp((s) => s.setLang);
  const user = useApp((s) => s.user);
  const openAuth = useApp((s) => s.openAuth);
  const refreshUser = useApp((s) => s.refreshUser);
  const installEvent = useApp((s) => s.installEvent);
  const T = getDict(lang);
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [q, setQ] = useState('');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const count = useWatchlistCount();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!q.trim()) return;
    nav({ name: 'search', q: q.trim() });
    setSearchOpen(false);
  };

  const doInstall = async () => {
    const ev: any = installEvent;
    if (!ev) return;
    ev.prompt?.();
    try {
      await ev.userChoice;
    } catch {}
    useApp.getState().setInstallEvent(null);
  };

  const logout = async () => {
    await api('/api/auth/logout', { method: 'POST' }).catch(() => {});
    await refreshUser();
    toast.success(T.logoutSuccess);
    nav({ name: 'home' });
  };

  const navLinks = (
    <>
      {[
        { label: T.navHome, action: () => nav({ name: 'home' }) },
        { label: T.navMovies, action: () => nav({ name: 'browse', type: 'MOVIE' }) },
        { label: T.navSeries, action: () => nav({ name: 'browse', type: 'SERIES' }) },
        { label: T.navAnime, action: () => nav({ name: 'browse', genre: 'anime' }) },
        { label: T.navMyList, action: () => nav({ name: 'watchlist' }) },
      ].map((l) => (
        <button
          key={l.label}
          onClick={l.action}
          className="rounded-lg px-3 py-1.5 text-sm font-semibold text-foreground/85 transition-colors hover:bg-white/5 hover:text-primary"
        >
          {l.label}
        </button>
      ))}
      <button
        onClick={() => nav({ name: 'plans' })}
        className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm font-black text-vip transition-colors hover:bg-vip/10"
      >
        <Crown className="size-4" />
        {T.navVip}
      </button>
    </>
  );

  return (
    <>
      <header
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
          scrolled || searchOpen
            ? 'glass border-b border-white/5 shadow-lg shadow-black/40'
            : 'bg-gradient-to-b from-black/85 via-black/40 to-transparent'
        }`}
      >
        <div className="mx-auto flex h-16 max-w-[1500px] items-center gap-3 px-4 md:h-[72px] md:gap-5 md:px-8">
          <BrandLogo />

          {/* روابط سطح المكتب */}
          <nav className="hidden items-center gap-1 md:flex" aria-label="main">
            {navLinks}
          </nav>

          <div className="ms-auto flex items-center gap-2">
            {/* بحث سطح المكتب */}
            <form onSubmit={submitSearch} className="hidden md:block">
              <div className="relative">
                <Search className="pointer-events-none absolute top-1/2 size-4 -translate-y-1/2 text-muted-foreground start-3" />
                <Input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder={T.searchPlaceholder}
                  className="h-10 w-56 rounded-xl border-white/10 bg-black/40 ps-9 text-sm focus-visible:ring-primary/60 lg:w-72"
                />
              </div>
            </form>

            {/* زر بحث للجوال */}
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full md:hidden"
              aria-label={T.search}
              onClick={() => setSearchOpen((v) => !v)}
            >
              {searchOpen ? <X className="size-5" /> : <Search className="size-5" />}
            </Button>

            {/* تثبيت التطبيق */}
            {installEvent && (
              <Button
                variant="outline"
                size="sm"
                onClick={doInstall}
                className="hidden rounded-xl border-primary/40 bg-primary/10 font-bold text-primary hover:bg-primary/20 sm:flex"
              >
                <Download className="size-4" />
                {T.installApp}
              </Button>
            )}

            {/* تبديل اللغة */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')}
              className="rounded-xl px-2.5 font-black"
              aria-label={T.language}
            >
              <Languages className="size-5" />
              <span className="text-xs">{lang === 'ar' ? 'EN' : 'ع'}</span>
            </Button>

            {/* الحساب */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className="grid size-10 place-items-center rounded-full text-sm font-black text-white ring-2 ring-primary/60 transition hover:ring-primary"
                    style={{ backgroundColor: user.avatarColor }}
                    aria-label={T.account}
                  >
                    {user.name.trim().charAt(0)}
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64">
                  <DropdownMenuLabel>
                    <p className="truncate text-sm font-bold">{user.name}</p>
                    <p className="truncate text-xs font-normal text-muted-foreground">{user.email}</p>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {user.isVip ? (
                    <div className="flex items-center gap-2 px-2 py-1.5">
                      <Crown className="size-4 text-vip" />
                      <span className="gold-text text-sm font-black">{T.vipActive}</span>
                    </div>
                  ) : (
                    <DropdownMenuItem onClick={() => nav({ name: 'plans' })} className="gap-2">
                      <Crown className="size-4 text-vip" />
                      <span className="font-bold text-vip">{T.vipCta}</span>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={() => nav({ name: 'watchlist' })} className="gap-2">
                    <Bookmark className="size-4" />
                    {T.navMyList}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSettingsOpen(true)} className="gap-2">
                    <Settings className="size-4" />
                    {T.settings}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout} className="gap-2 text-destructive focus:text-destructive">
                    <LogOut className="size-4" />
                    {T.logout}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                onClick={() => openAuth('login')}
                className="h-10 rounded-xl bg-primary px-4 font-extrabold text-primary-foreground hover:bg-primary/90"
              >
                <User className="size-4" />
                <span className="hidden sm:inline">{T.login}</span>
              </Button>
            )}
          </div>
        </div>

        {/* شريط بحث الجوال */}
        {searchOpen && (
          <form onSubmit={submitSearch} className="border-t border-white/5 p-3 md:hidden">
            <div className="relative">
              <Search className="pointer-events-none absolute top-1/2 size-4 -translate-y-1/2 text-muted-foreground start-3" />
              <Input
                autoFocus
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder={T.searchPlaceholder}
                className="h-11 rounded-xl border-white/10 bg-black/50 ps-9"
              />
            </div>
          </form>
        )}
      </header>

      <SettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />
    </>
  );
}

function SettingsDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const lang = useApp((s) => s.lang);
  const setLang = useApp((s) => s.setLang);
  const T = getDict(lang);
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>{T.settings}</DialogTitle>
          <DialogDescription>{T.appName}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <p className="mb-2 text-sm font-bold">{T.language}</p>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant={lang === 'ar' ? 'default' : 'outline'}
                onClick={() => setLang('ar')}
                className="font-bold"
              >
                العربية
              </Button>
              <Button
                variant={lang === 'en' ? 'default' : 'outline'}
                onClick={() => setLang('en')}
                className="font-bold"
              >
                English
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
