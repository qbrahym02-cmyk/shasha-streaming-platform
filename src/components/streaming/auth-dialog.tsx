'use client';

// نافذة تسجيل الدخول / إنشاء حساب
import { useState } from 'react';
import { Loader2, LogIn, Sparkles, UserPlus } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { api } from '@/lib/api-client';
import { useApp } from '@/lib/store';
import { getDict } from '@/lib/i18n';
import type { PublicUser } from '@/lib/types';

export function AuthDialog() {
  const lang = useApp((s) => s.lang);
  const open = useApp((s) => s.authOpen);
  const tab = useApp((s) => s.authTab);
  const closeAuth = useApp((s) => s.closeAuth);
  const refreshUser = useApp((s) => s.refreshUser);
  const T = getDict(lang);

  const [activeTab, setActiveTab] = useState<'login' | 'register'>(tab);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // مزامنة التبويب عند فتح النافذة
  const [lastOpen, setLastOpen] = useState(false);
  if (open !== lastOpen) {
    setLastOpen(open);
    if (open) {
      setActiveTab(tab);
      setErr(null);
    }
  }

  const submit = async (mode: 'login' | 'register') => {
    setErr(null);
    setBusy(true);
    try {
      const body = mode === 'login' ? { email, password } : { email, password, name };
      await api<PublicUser>(`/api/auth/${mode}`, { method: 'POST', body: JSON.stringify(body) });
      await refreshUser();
      closeAuth();
      setName('');
      setPassword('');
      toast.success(mode === 'login' ? T.loginSuccess : T.registerSuccess);
    } catch (e: any) {
      setErr(e?.message || T.errValidation);
    } finally {
      setBusy(false);
    }
  };

  const fillDemo = (demoEmail: string) => {
    setActiveTab('login');
    setEmail(demoEmail);
    setPassword('demo1234');
    setErr(null);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && closeAuth()}>
      <DialogContent className="max-w-md">
        <DialogHeader className="text-center">
          <div className="mx-auto mb-2 grid size-16 place-items-center rounded-full bg-primary/15 ring-2 ring-primary/40">
            <Sparkles className="size-8 text-primary" />
          </div>
          <DialogTitle className="text-center text-2xl">{T.authWelcome}</DialogTitle>
          <DialogDescription className="text-center">{T.authSubtitle}</DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'login' | 'register')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login" className="font-bold">
              {T.loginTab}
            </TabsTrigger>
            <TabsTrigger value="register" className="font-bold">
              {T.registerTab}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="login" className="space-y-3 pt-3">
            <div className="space-y-1.5">
              <Label htmlFor="login-email">{T.email}</Label>
              <Input
                id="login-email"
                type="email"
                dir="ltr"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="rounded-xl"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="login-password">{T.password}</Label>
              <Input
                id="login-password"
                type="password"
                dir="ltr"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="rounded-xl"
              />
            </div>
            <Button
              onClick={() => submit('login')}
              disabled={busy || !email || !password}
              className="h-12 w-full rounded-xl bg-primary text-base font-black text-primary-foreground hover:bg-primary/90"
            >
              {busy ? <Loader2 className="size-5 animate-spin" /> : <LogIn className="size-5" />}
              {T.loginBtn}
            </Button>
          </TabsContent>

          <TabsContent value="register" className="space-y-3 pt-3">
            <div className="space-y-1.5">
              <Label htmlFor="reg-name">{T.fullName}</Label>
              <Input
                id="reg-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={T.fullName}
                className="rounded-xl"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="reg-email">{T.email}</Label>
              <Input
                id="reg-email"
                type="email"
                dir="ltr"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="rounded-xl"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="reg-password">{T.password}</Label>
              <Input
                id="reg-password"
                type="password"
                dir="ltr"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="rounded-xl"
              />
            </div>
            <Button
              onClick={() => submit('register')}
              disabled={busy || !email || !password || !name}
              className="h-12 w-full rounded-xl bg-primary text-base font-black text-primary-foreground hover:bg-primary/90"
            >
              {busy ? <Loader2 className="size-5 animate-spin" /> : <UserPlus className="size-5" />}
              {T.registerBtn}
            </Button>
          </TabsContent>
        </Tabs>

        {err && (
          <p className="rounded-xl bg-destructive/10 p-3 text-center text-sm font-bold text-destructive">
            {err}
          </p>
        )}

        <div className="rounded-xl bg-secondary p-3 text-center">
          <p className="mb-2 text-xs font-black text-vip">{T.demoBoxTitle}</p>
          <div className="flex flex-wrap justify-center gap-2">
            <button
              onClick={() => fillDemo('demo@shasha.app')}
              className="rounded-lg bg-vip/20 px-3 py-1.5 text-xs font-bold text-vip ring-1 ring-vip/40 transition hover:bg-vip/30"
            >
              VIP — demo@shasha.app
            </button>
            <button
              onClick={() => fillDemo('free@shasha.app')}
              className="rounded-lg bg-primary/15 px-3 py-1.5 text-xs font-bold text-primary ring-1 ring-primary/40 transition hover:bg-primary/25"
            >
              {T.free} — free@shasha.app
            </button>
          </div>
          <p className="mt-2 text-[11px] text-muted-foreground" dir="ltr">
            demo1234
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
