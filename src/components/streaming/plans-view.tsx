'use client';

// صفحة باقات VIP
import { useState } from 'react';
import {
  BadgeCheck,
  Check,
  Crown,
  Download,
  MonitorSmartphone,
  ShieldCheck,
  Sparkles,
  Zap,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { api, useApi } from '@/lib/api-client';
import { useApp } from '@/lib/store';
import { getDict } from '@/lib/i18n';
import type { PlanInfo } from '@/lib/types';

export function PlansView() {
  const lang = useApp((s) => s.lang);
  const user = useApp((s) => s.user);
  const refreshUser = useApp((s) => s.refreshUser);
  const openAuth = useApp((s) => s.openAuth);
  const T = getDict(lang);
  const { data: plans, loading } = useApi<PlanInfo[]>('/api/plans');
  const [confirmPlan, setConfirmPlan] = useState<PlanInfo | null>(null);
  const [busy, setBusy] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);

  const perks = [
    { icon: <Zap className="size-6" />, text: T.vipPerk1 },
    { icon: <MonitorSmartphone className="size-6" />, text: T.vipPerk2 },
    { icon: <Sparkles className="size-6" />, text: T.vipPerk3 },
    { icon: <Download className="size-6" />, text: T.vipPerk4 },
    { icon: <BadgeCheck className="size-6" />, text: T.vipPerk5 },
    { icon: <ShieldCheck className="size-6" />, text: T.vipPerk6 },
  ];

  const subscribe = async () => {
    if (!confirmPlan) return;
    setBusy(true);
    try {
      await api('/api/subscribe', { method: 'POST', body: JSON.stringify({ planCode: confirmPlan.code }) });
      await refreshUser();
      toast.success(T.activated);
      setConfirmPlan(null);
    } catch (e: any) {
      toast.error(e?.message || T.error);
    } finally {
      setBusy(false);
    }
  };

  const cancelSub = async () => {
    setBusy(true);
    try {
      await api('/api/subscribe', { method: 'DELETE' });
      await refreshUser();
      toast.success(T.cancelled);
      setCancelOpen(false);
    } catch (e: any) {
      toast.error(e?.message || T.error);
    } finally {
      setBusy(false);
    }
  };

  const fmtDate = (iso: string | null) => {
    if (!iso) return '';
    return new Date(iso).toLocaleDateString(lang === 'ar' ? 'ar-DZ' : 'en-GB', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="pt-24 md:pt-28">
      {/* ترويسة */}
      <div className="relative overflow-hidden px-4 py-10 text-center md:py-14">
        <div className="absolute inset-0 bg-[radial-gradient(600px_300px_at_50%_0%,rgba(232,185,35,0.12),transparent)]" />
        <div className="relative mx-auto max-w-2xl">
          <div className="mx-auto mb-4 grid size-20 place-items-center rounded-full bg-vip/15 ring-2 ring-vip/40">
            <Crown className="size-10 text-vip" />
          </div>
          <h1 className="gold-text text-4xl font-black md:text-5xl">{T.vipTitle}</h1>
          <p className="mt-3 text-sm text-muted-foreground md:text-base">{T.vipSubtitle}</p>
        </div>
      </div>

      {/* المزايا */}
      <div className="mx-auto grid max-w-4xl grid-cols-2 gap-3 px-4 pb-10 sm:grid-cols-3 md:px-8">
        {perks.map((p) => (
          <div
            key={p.text}
            className="flex flex-col items-center gap-2 rounded-2xl bg-card p-4 text-center ring-1 ring-white/5"
          >
            <span className="text-vip">{p.icon}</span>
            <span className="text-xs font-bold md:text-sm">{p.text}</span>
          </div>
        ))}
      </div>

      {/* الحالة الحالية */}
      {user && (
        <div className="mx-auto mb-8 max-w-4xl px-4 md:px-8">
          <div
            className={`flex flex-wrap items-center gap-3 rounded-2xl p-4 ring-1 ${
              user.isVip ? 'bg-vip/10 ring-vip/40' : 'bg-card ring-white/5'
            }`}
          >
            <Crown className={`size-8 ${user.isVip ? 'text-vip' : 'text-muted-foreground'}`} />
            <div className="flex-1">
              <p className="text-sm font-black">
                {user.isVip ? (
                  <span className="gold-text">{T.vipActive}</span>
                ) : (
                  T.notSubscribed
                )}
              </p>
              {user.isVip && user.vipUntil && (
                <p className="text-xs text-muted-foreground">
                  {T.expiresOn} {fmtDate(user.vipUntil)}
                </p>
              )}
            </div>
            {user.isVip && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCancelOpen(true)}
                className="rounded-xl border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive"
              >
                {T.cancelSub}
              </Button>
            )}
          </div>
        </div>
      )}

      {/* الباقات */}
      <div className="mx-auto max-w-5xl px-4 md:px-8">
        <h2 className="mb-5 text-center text-2xl font-black">{T.choosePlan}</h2>
        {loading ? (
          <div className="grid gap-4 md:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-80 rounded-3xl shimmer" />
            ))}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-3">
            {(plans ?? []).map((p) => (
              <div
                key={p.code}
                className={`relative flex flex-col rounded-3xl bg-card p-6 ring-1 transition ${
                  p.highlight
                    ? 'ring-2 ring-vip shadow-xl shadow-vip/10 md:-translate-y-2'
                    : 'ring-white/5 hover:ring-white/15'
                }`}
              >
                {p.highlight && (
                  <span className="absolute -top-3 start-1/2 -translate-x-1/2 rounded-full bg-vip px-4 py-1 text-xs font-black text-vip-foreground rtl:translate-x-1/2">
                    ★ {T.sortPopular}
                  </span>
                )}
                <p className="text-lg font-black">{lang === 'ar' ? p.nameAr : p.nameEn}</p>
                <div className="mt-3 flex items-end gap-2">
                  <span className="text-4xl font-black text-primary">
                    {p.priceDzd.toLocaleString('en-US')}
                  </span>
                  <span className="pb-1.5 text-sm font-bold text-muted-foreground">{T.dzd}</span>
                </div>
                {p.originalDzd && (
                  <p className="mt-1 text-sm text-muted-foreground">
                    <span className="line-through">{p.originalDzd.toLocaleString('en-US')} {T.dzd}</span>
                  </p>
                )}
                <ul className="mt-5 flex-1 space-y-2.5">
                  {(lang === 'ar' ? p.featuresAr : p.featuresEn).map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm">
                      <Check className="size-4 shrink-0 text-primary" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Button
                  onClick={() => (user ? setConfirmPlan(p) : openAuth('register'))}
                  className={`mt-6 h-12 rounded-xl text-base font-black ${
                    p.highlight
                      ? 'bg-vip text-vip-foreground hover:bg-vip/90'
                      : 'bg-primary text-primary-foreground hover:bg-primary/90'
                  }`}
                >
                  {T.activateNow}
                </Button>
              </div>
            ))}
          </div>
        )}
        <p className="mx-auto mt-8 max-w-lg text-center text-xs leading-relaxed text-muted-foreground">
          {T.demoPaymentDesc}
        </p>
      </div>

      {/* تأكيد التفعيل التجريبي */}
      <Dialog open={!!confirmPlan} onOpenChange={(v) => !v && setConfirmPlan(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{T.demoPayment}</DialogTitle>
            <DialogDescription>{T.demoPaymentDesc}</DialogDescription>
          </DialogHeader>
          {confirmPlan && (
            <div className="rounded-xl bg-secondary p-4">
              <p className="text-sm font-bold">
                {lang === 'ar' ? confirmPlan.nameAr : confirmPlan.nameEn}
              </p>
              <p className="mt-1 text-2xl font-black text-primary">
                {confirmPlan.priceDzd.toLocaleString('en-US')} {T.dzd}
              </p>
            </div>
          )}
          <div className="flex gap-2">
            <Button
              onClick={subscribe}
              disabled={busy}
              className="flex-1 rounded-xl bg-vip font-black text-vip-foreground hover:bg-vip/90"
            >
              {busy ? '...' : T.confirm}
            </Button>
            <Button variant="outline" onClick={() => setConfirmPlan(null)} className="rounded-xl font-bold">
              {T.cancel}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* تأكيد الإلغاء */}
      <Dialog open={cancelOpen} onOpenChange={setCancelOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{T.cancelSub}</DialogTitle>
            <DialogDescription>{T.cancelConfirm}</DialogDescription>
          </DialogHeader>
          <div className="flex gap-2">
            <Button
              onClick={cancelSub}
              disabled={busy}
              className="flex-1 rounded-xl bg-destructive font-bold text-white hover:bg-destructive/90"
            >
              {T.confirm}
            </Button>
            <Button variant="outline" onClick={() => setCancelOpen(false)} className="rounded-xl font-bold">
              {T.cancel}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
