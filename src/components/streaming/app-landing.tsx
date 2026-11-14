'use client';

// صفحة هبوط تطبيق أندرويد — مبنية وفق قواعد تحويل landing-page-design:
// 1) فوق الطية: عنوان نتيجة + عنوان فرعي + CTA أساسي + إثبات اجتماعي + صورة النتيجة (موك-أب هاتف)
// 2) شريط إثبات اجتماعي  3) الميزات  4) لقطات الشاشة  5) خطوات التثبيت
// 6) المنصات  7) الأسئلة الشائعة  8) CTA ختامي + شريط تحميل ثابت للجوال
import { Crown, Download, Globe, Languages, MonitorSmartphone, Play, RefreshCcw, ShieldCheck, Smartphone, Zap } from 'lucide-react';
import { toast } from 'sonner';
import { useApp } from '@/lib/store';
import { getDict } from '@/lib/i18n';
import { APP_DOWNLOAD, BRAND } from '@/lib/config';
import { LogoMark, nav } from './ui-bits';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

// ===== زر التحميل الأساسي (أهم عنصر تحويل — ≥48px تباين عالٍ) =====
export function DownloadButton({ size = 'lg', className = '' }: { size?: 'lg' | 'md'; className?: string }) {
  const lang = useApp((s) => s.lang);
  const T = getDict(lang);
  const onDownload = () => {
    const a = document.createElement('a');
    a.href = APP_DOWNLOAD.apkUrl;
    a.download = `shasha-v${APP_DOWNLOAD.version}.apk`;
    a.rel = 'noopener';
    a.target = '_blank';
    document.body.appendChild(a);
    a.click();
    a.remove();
    toast.success(T.appDownloadStarted);
  };
  return (
    <button
      onClick={onDownload}
      className={`group relative inline-flex w-full items-center justify-center gap-3 rounded-2xl bg-primary font-black text-primary-foreground shadow-[0_10px_40px_-8px_rgba(0,210,106,0.6)] transition-all hover:scale-[1.02] hover:bg-[#00e07a] active:scale-[0.98] sm:w-auto ${
        size === 'lg' ? 'h-14 px-8 text-lg' : 'h-12 px-6'
      } ${className}`}
    >
      <Download className="size-6 transition-transform group-hover:-translate-y-0.5" strokeWidth={2.5} />
      {T.appDownloadBtn}
    </button>
  );
}

// ===== موك-أب الهاتف: يعرض النتيجة (مشاهدة فيلم داخل التطبيق) =====
function PhoneMockup({
  image,
  titleAr,
  badge,
  className = '',
  showNav = true,
}: {
  image: string;
  titleAr: string;
  badge?: string;
  className?: string;
  showNav?: boolean;
}) {
  return (
    <div
      className={`relative mx-auto aspect-[9/18.5] w-64 overflow-hidden rounded-[2.6rem] border-[6px] border-[#1c2620] bg-[#070b09] shadow-[0_30px_80px_-20px_rgba(0,0,0,0.9)] ring-1 ring-white/10 sm:w-72 ${className}`}
      dir="rtl"
    >
      {/* نوتش الكاميرا */}
      <div className="absolute left-1/2 top-2.5 z-20 h-5 w-24 -translate-x-1/2 rounded-full bg-black/90 ring-1 ring-white/5" />
      {/* شاشة التطبيق: مشهد فيلم */}
      <div className="absolute inset-0">
        <img src={image} alt={titleAr} className="absolute inset-0 size-full object-cover" loading="lazy" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#070b09] via-[#070b09]/25 to-black/45" />
        {/* شريط علوي داخل التطبيق */}
        <div className="absolute inset-x-0 top-0 z-10 flex items-center justify-between px-5 pt-9">
          <div className="flex items-center gap-1.5">
            <LogoMark size={18} />
            <span className="text-xs font-black text-white">{BRAND.nameAr}</span>
          </div>
          {badge && (
            <span className="rounded-md bg-vip/90 px-1.5 py-0.5 text-[9px] font-black text-vip-foreground">{badge}</span>
          )}
        </div>
        {/* بطاقة المشهد: عنوان + زر تشغيل */}
        <div className="absolute inset-x-0 bottom-0 z-10 p-4 pb-5">
          <p className="mb-1 text-[10px] font-bold text-primary">شاهد الآن بجودة 4K</p>
          <p className="text-lg font-black leading-tight text-white">{titleAr}</p>
          <div className="mt-3 flex items-center gap-2">
            <span className="grid size-10 place-items-center rounded-full bg-primary text-primary-foreground shadow-[0_0_20px_rgba(0,210,106,0.5)]">
              <Play className="size-5 fill-primary-foreground" />
            </span>
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/20">
              <div className="h-full w-2/3 rounded-full bg-primary" />
            </div>
            <span className="text-[10px] font-bold text-white/80">24:12</span>
          </div>
        </div>
        {/* شريط التبويب السفلي داخل التطبيق */}
        {showNav && (
          <div className="absolute inset-x-0 bottom-0 z-10 flex h-12 items-center justify-around border-t border-white/10 bg-black/70 backdrop-blur-md">
            {[0, 1, 2, 3, 4].map((i) => (
              <span
                key={i}
                className={`h-1.5 w-6 rounded-full ${i === 0 ? 'bg-primary' : 'bg-white/25'}`}
                aria-hidden="true"
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ===== الصفحة =====
export function AppLanding() {
  const lang = useApp((s) => s.lang);
  const T = getDict(lang);
  const isAr = lang === 'ar';

  const stats = [
    { value: T.appStatTitlesValue, label: T.appStatTitles },
    { value: T.appStatQualityValue, label: T.appStatQuality },
    { value: T.appStatPlatformsValue, label: T.appStatPlatforms },
    { value: T.appStatFreeValue, label: T.appStatFree },
  ];

  const features = [
    { icon: Zap, title: T.appFeature1Title, desc: T.appFeature1Desc, accent: 'text-primary' },
    { icon: RefreshCcw, title: T.appFeature2Title, desc: T.appFeature2Desc, accent: 'text-sky-400' },
    { icon: Languages, title: T.appFeature3Title, desc: T.appFeature3Desc, accent: 'text-amber-300' },
    { icon: Crown, title: T.appFeature4Title, desc: T.appFeature4Desc, accent: 'text-vip' },
  ];

  const steps = [
    { n: 1, icon: Download, title: T.appHow1Title, desc: T.appHow1Desc },
    { n: 2, icon: ShieldCheck, title: T.appHow2Title, desc: T.appHow2Desc },
    { n: 3, icon: Play, title: T.appHow3Title, desc: T.appHow3Desc },
  ];

  const faqs = [
    { q: T.appFaq1Q, a: T.appFaq1A },
    { q: T.appFaq2Q, a: T.appFaq2A },
    { q: T.appFaq3Q, a: T.appFaq3A },
    { q: T.appFaq4Q, a: T.appFaq4A },
    { q: T.appFaq5Q, a: T.appFaq5A },
    { q: T.appFaq6Q, a: T.appFaq6A },
  ];

  return (
    <div className="pb-24 md:pb-0">
      {/* ============ 1) البطل — كل شيء فوق الطية ============ */}
      <section className="relative overflow-hidden">
        {/* خلفية سينمائية */}
        <div className="absolute inset-0 -z-10">
          <img src="/backdrops/tears-of-steel.jpg" alt="" className="size-full object-cover opacity-25" />
          <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/90 to-background" />
        </div>

        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 pb-14 pt-28 md:grid-cols-2 md:gap-6 md:px-8 md:pb-20 md:pt-36">
          {/* النصوص + CTA */}
          <div className="text-center md:text-start">
            <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-bold text-primary">
              <Smartphone className="size-3.5" />
              {T.appLandingBadge}
            </span>
            <h1 className="text-balance text-4xl font-black leading-[1.15] sm:text-5xl md:text-[3.4rem]">
              {T.appHeroTitle}
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-pretty text-base leading-relaxed text-muted-foreground md:mx-0 md:text-lg">
              {T.appHeroSub}
            </p>

            <div className="mt-8 flex flex-col items-center gap-3 md:items-start">
              <DownloadButton />
              <p className="text-xs font-semibold text-muted-foreground" dir="auto">
                {T.appDownloadApk} · {T.appVersionMeta}
              </p>
            </div>
          </div>

          {/* موك-أب الهاتف (يُظهر النتيجة: تشاهد فيلماً) */}
          <div className="relative">
            <div className="absolute inset-0 -z-10 mx-auto my-auto size-[85%] rounded-full bg-primary/15 blur-[90px]" />
            <PhoneMockup image="/backdrops/sintel.jpg" titleAr="فيلم سينتيل" badge="4K" className="animate-phone-float" />
            {/* بطاقة عائمة: تقييم */}
            <div className="glass absolute -top-2 start-2 flex items-center gap-2 rounded-2xl px-3.5 py-2.5 ring-1 ring-white/10 md:-start-4">
              <span className="grid size-8 place-items-center rounded-full bg-amber-400/15">
                <Crown className="size-4 text-vip" />
              </span>
              <div className="leading-tight">
                <p className="text-sm font-black">{isAr ? 'تقييم 9.2' : 'Rated 9.2'}</p>
                <p className="text-[10px] text-muted-foreground">{isAr ? 'الأكثر رواجاً' : 'Trending now'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* ============ 2) شريط الإثبات الاجتماعي ============ */}
        <div className="border-y border-white/5 bg-card/60">
          <div className="mx-auto grid max-w-5xl grid-cols-2 divide-white/5 px-4 py-6 sm:grid-cols-4 sm:divide-x sm:divide-x-reverse md:px-8">
            {stats.map((s, i) => (
              <div key={i} className="flex flex-col items-center gap-0.5 py-2 text-center">
                <span className="text-2xl font-black text-primary md:text-3xl" dir="ltr">
                  {s.value}
                </span>
                <span className="max-w-[160px] text-[11px] font-semibold leading-tight text-muted-foreground">
                  {s.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ 3) الميزات ============ */}
      <section className="mx-auto max-w-6xl px-4 py-16 md:px-8 md:py-24">
        <div className="mx-auto mb-10 max-w-2xl text-center md:mb-14">
          <h2 className="text-3xl font-black md:text-4xl">{T.appFeaturesTitle}</h2>
          <p className="mt-4 text-muted-foreground md:text-lg">{T.appFeaturesSub}</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 md:gap-6">
          {features.map((f, i) => (
            <div
              key={i}
              className="group rounded-3xl border border-white/5 bg-card p-6 transition-all hover:border-primary/25 hover:bg-accent/40 md:p-8"
            >
              <span className="mb-4 grid size-12 place-items-center rounded-2xl bg-primary/10 ring-1 ring-primary/20">
                <f.icon className={`size-6 ${f.accent}`} strokeWidth={2.2} />
              </span>
              <h3 className="mb-2 text-lg font-extrabold">{f.title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
        {/* CTA مكرر بعد الميزات */}
        <div className="mt-10 flex flex-col items-center gap-2">
          <DownloadButton size="md" />
        </div>
      </section>

      {/* ============ 4) لقطات الشاشة ============ */}
      <section className="relative overflow-hidden border-y border-white/5 bg-gradient-to-b from-card/40 via-background to-card/40 py-16 md:py-24">
        <div className="mx-auto max-w-6xl px-4 md:px-8">
          <div className="mx-auto mb-12 max-w-2xl text-center md:mb-16">
            <h2 className="text-3xl font-black md:text-4xl">{T.appScreensTitle}</h2>
            <p className="mt-4 text-muted-foreground md:text-lg">{T.appScreensSub}</p>
          </div>
          <div className="flex items-end justify-center gap-5 overflow-x-auto pb-4 sm:gap-8 md:gap-12" dir="ltr">
            <PhoneMockup
              image="/backdrops/saif-al-fajr.jpg"
              titleAr="سيف الفجر"
              badge="VIP"
              className="w-52 rotate-[3deg] opacity-90 sm:w-56"
              showNav={false}
            />
            <PhoneMockup
              image="/backdrops/sintel.jpg"
              titleAr="سينتيل"
              badge="4K"
              className="w-56 scale-105 sm:w-64"
            />
            <PhoneMockup
              image="/backdrops/thil-al-sahra.jpg"
              titleAr="ظل الصحراء"
              badge="HD"
              className="w-52 -rotate-[3deg] opacity-90 sm:w-56"
              showNav={false}
            />
          </div>
        </div>
      </section>

      {/* ============ 5) خطوات التثبيت ============ */}
      <section className="mx-auto max-w-6xl px-4 py-16 md:px-8 md:py-24">
        <div className="mx-auto mb-10 max-w-2xl text-center md:mb-14">
          <h2 className="text-3xl font-black md:text-4xl">{T.appHowTitle}</h2>
          <p className="mt-4 text-muted-foreground md:text-lg">{T.appHowSub}</p>
        </div>
        <div className="grid gap-4 md:grid-cols-3 md:gap-6">
          {steps.map((s, i) => (
            <div key={i} className="relative rounded-3xl border border-white/5 bg-card p-6 md:p-8">
              <div className="mb-5 flex items-center gap-3">
                <span className="grid size-11 place-items-center rounded-2xl bg-primary text-lg font-black text-primary-foreground">
                  {s.n}
                </span>
                <s.icon className="size-6 text-primary" strokeWidth={2.2} />
              </div>
              <h3 className="mb-2 text-lg font-extrabold">{s.title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{s.desc}</p>
              {i < 2 && (
                <span className="absolute -end-3 top-1/2 hidden -translate-y-1/2 text-2xl font-black text-primary/30 md:block">
                  ←
                </span>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ============ 6) المنصات ============ */}
      <section className="mx-auto max-w-6xl px-4 pb-16 md:px-8 md:pb-24">
        <div className="mx-auto mb-10 max-w-2xl text-center md:mb-14">
          <h2 className="text-3xl font-black md:text-4xl">{T.appDevicesTitle}</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-3 md:gap-6">
          {/* أندرويد — مميز */}
          <div className="rounded-3xl border-2 border-primary/50 bg-gradient-to-b from-primary/10 to-transparent p-6 md:p-8">
            <div className="mb-4 flex items-center justify-between">
              <span className="grid size-12 place-items-center rounded-2xl bg-primary/15 ring-1 ring-primary/30">
                <Smartphone className="size-6 text-primary" />
              </span>
              <span className="rounded-full bg-primary px-2.5 py-1 text-[10px] font-black text-primary-foreground">
                {isAr ? 'جاهز للتحميل' : 'Ready to download'}
              </span>
            </div>
            <h3 className="mb-1 text-lg font-extrabold">{T.appDevicesAndroid}</h3>
            <p className="mb-5 text-sm text-muted-foreground">{T.appDevicesAndroidDesc}</p>
            <DownloadButton size="md" />
          </div>
          {/* iOS */}
          <div className="rounded-3xl border border-white/5 bg-card p-6 md:p-8">
            <span className="mb-4 grid size-12 place-items-center rounded-2xl bg-white/5 ring-1 ring-white/10">
              <MonitorSmartphone className="size-6 text-foreground/80" />
            </span>
            <h3 className="mb-1 text-lg font-extrabold">{T.appDevicesIos}</h3>
            <p className="text-sm leading-relaxed text-muted-foreground">{T.appDevicesIosDesc}</p>
          </div>
          {/* الويب */}
          <div className="rounded-3xl border border-white/5 bg-card p-6 md:p-8">
            <span className="mb-4 grid size-12 place-items-center rounded-2xl bg-white/5 ring-1 ring-white/10">
              <Globe className="size-6 text-foreground/80" />
            </span>
            <h3 className="mb-1 text-lg font-extrabold">{T.appDevicesWeb}</h3>
            <p className="mb-5 text-sm text-muted-foreground">{T.appDevicesWebDesc}</p>
            <button
              onClick={() => nav({ name: 'home' })}
              className="h-12 w-full rounded-2xl border border-white/15 bg-white/5 font-bold transition-colors hover:bg-white/10"
            >
              {T.appGoWeb}
            </button>
          </div>
        </div>
      </section>

      {/* ============ 7) الأسئلة الشائعة ============ */}
      <section className="mx-auto max-w-3xl px-4 pb-16 md:px-8 md:pb-24">
        <h2 className="mb-10 text-center text-3xl font-black md:mb-14 md:text-4xl">{T.appFaqTitle}</h2>
        <Accordion type="single" collapsible className="rounded-3xl border border-white/5 bg-card px-6 md:px-8">
          {faqs.map((f, i) => (
            <AccordionItem key={i} value={`faq-${i}`} className="border-white/5">
              <AccordionTrigger className="text-start text-base font-extrabold hover:text-primary hover:no-underline md:text-lg">
                {f.q}
              </AccordionTrigger>
              <AccordionContent className="text-sm leading-relaxed text-muted-foreground md:text-base">
                {f.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>

      {/* ============ 8) CTA ختامي + QR ============ */}
      <section className="relative overflow-hidden border-t border-white/5">
        <div className="absolute inset-0 -z-10">
          <img src="/backdrops/thil-al-sahra.jpg" alt="" className="size-full object-cover opacity-20" />
          <div className="absolute inset-0 bg-gradient-to-b from-background via-background/85 to-background" />
        </div>
        <div className="mx-auto flex max-w-4xl flex-col items-center gap-6 px-4 py-16 text-center md:px-8 md:py-24">
          <h2 className="text-3xl font-black md:text-5xl">{T.appFinalTitle}</h2>
          <p className="max-w-xl text-muted-foreground md:text-lg">{T.appFinalSub}</p>
          <DownloadButton />
          <p className="text-xs font-semibold text-muted-foreground">{T.appVersionMeta}</p>

          <div className="mt-4 flex flex-col items-center gap-3 rounded-3xl border border-white/10 bg-card/70 p-6 backdrop-blur-sm">
            <span className="grid size-36 place-items-center rounded-2xl bg-background p-2 ring-1 ring-white/10">
              <img src="/download/qr-app.svg" alt="QR — تحميل تطبيق شاشة" className="size-full" />
            </span>
            <p className="max-w-[240px] text-xs font-semibold leading-relaxed text-muted-foreground">
              {T.appQrHint}
            </p>
          </div>

          <p className="mt-2 text-sm text-muted-foreground">{T.appOtherPlatforms}</p>
          <button
            onClick={() => nav({ name: 'home' })}
            className="text-sm font-bold text-primary underline-offset-4 transition-colors hover:text-primary/80 hover:underline"
          >
            {T.appGoWeb} ←
          </button>
        </div>
      </section>

      {/* شريط تحميل ثابت أسفل الشاشة (جوال فقط) — فوق شريط التبويب */}
      <div className="glass fixed inset-x-0 bottom-[62px] z-40 border-t border-white/10 px-4 py-2.5 pb-[max(0.625rem,env(safe-area-inset-bottom))] md:hidden">
        <div className="flex items-center gap-3">
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <LogoMark size={30} />
            <div className="min-w-0 leading-tight">
              <p className="truncate text-sm font-black">{BRAND.nameAr} — {T.appLandingBadge}</p>
              <p className="truncate text-[10px] text-muted-foreground" dir="auto">
                {APP_DOWNLOAD.sizeMb} MB · {T.appVersionMeta}
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              const a = document.createElement('a');
              a.href = APP_DOWNLOAD.apkUrl;
              a.download = `shasha-v${APP_DOWNLOAD.version}.apk`;
              a.rel = 'noopener';
              a.target = '_blank';
              document.body.appendChild(a);
              a.click();
              a.remove();
              toast.success(T.appDownloadStarted);
            }}
            className="flex h-11 shrink-0 items-center gap-2 rounded-xl bg-primary px-4 font-black text-primary-foreground shadow-[0_6px_24px_-4px_rgba(0,210,106,0.55)] active:scale-95"
          >
            <Download className="size-5" strokeWidth={2.5} />
            APK
          </button>
        </div>
      </div>
    </div>
  );
}
