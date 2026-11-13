<div dir="rtl">

# شاشة | SHASHA — منصة بث متكاملة 🎬

منصة بث فيديو تجارية متكاملة على غرار خدمات OTT العالمية (بدون نسخ أي علامة تجارية أو محتوى محمي) — تعمل كـ **موقع ويب + تطبيق PWA + تطبيق أندرويد (APK)** من قاعدة كود واحدة.

![Platform](https://img.shields.io/badge/Platform-Web%20%2B%20PWA%20%2B%20Android-00d26a) ![License](https://img.shields.io/badge/License-MIT-e8b923) ![Lang](https://img.shields.io/badge/%D9%84%D8%BA%D8%A9-%D8%B9%D8%B1%D8%A8%D9%8A%20%2B%20English-00d26a)

---

## ✨ ماذا تتضمن المنصة؟

### 🎥 مشغل فيديو احترافي
- بث **HLS متكيف** (hls.js) مع تشغيل تلقائي للجودة حسب سرعة الإنترنت + تبديل يدوي (Auto / 1080p / 720p / ...)
- **ترجمات متعددة** ومسارات صوتية متعددة (عند توفرها في البث)
- سرعة تشغيل (0.5x → 2x)، تخطي ±10 ثانية، ملء الشاشة، صورة داخل صورة (PiP)
- **استكمال المشاهدة** من آخر موضع + حفظ دوري للتقدم
- **تشغيل الحلقة التالية تلقائياً** مع عد تنازلي
- اختصارات لوحة مفاتيح كاملة (مسافة، أسهم، F، M)

### 📚 كتالوج وواجهات
- صفحة رئيسية: بانر متحرك (Carousel)، صفوف: تابع المشاهدة / الرائج / حصري VIP / أفلام / مسلسلات / أنمي
- تصفح بفلاتر (النوع، التصنيف، VIP، الترتيب) + **بحث فوري**
- صفحة تفاصيل: خلفية، ملصق، تقييم، تصنيف عمري، حلقات مع أقفال VIP، أعمال مشابهة
- **عربية RTL + إنجليزية LTR** بضغطة زر

### 👤 حسابات واشتراكات
- تسجيل/دخول بالبريد (scrypt + جلسات كوكيز HttpOnly)
- **قائمة المفضلة** و**سجل المشاهدة** لكل مستخدم
- **عضوية VIP** مع بوابات قفل محتوى، باقات (شهري/3 أشهر/سنوي بالدينار الجزائري)، تفعيل تجريبي فوري (جاهز لربط CIB/الذهبية/بريدي موب عند الإطلاق)
- فحص الصلاحيات **من طرف الخادم** قبل كشف روابط الفيديو

### 📱 PWA + أندرويد
- تطبيق ويب قابل للتثبيت (manifest + service worker + أوفلاين بيدج)
- **APK أندرويد TWA** جاهز البناء عبر bubblewrap (انظر `docs/APK-BUILD.md`)
- iOS: إضافة للشاشة الرئيسية بدعم كامل

---

## 🧪 حسابات تجريبية جاهزة

| النوع | البريد | كلمة المرور |
|---|---|---|
| مشترك VIP | `demo@shasha.app` | `demo1234` |
| مستخدم مجاني | `free@shasha.app` | `demo1234` |

> المحتوى القابل للتشغيل أفلام مفتوحة المصدر من مؤسسة Blender (ترخيص CC) وبثوث تجريبية عامة (Apple/Mux/Bitmovin). باقي العناوين وهمية لأغراض العرض.

---

## 🛠 التقنيات

| الطبقة | التقنية |
|---|---|
| الواجهة | Next.js 16 (App Router) + TypeScript + Tailwind CSS 4 + shadcn/ui |
| الحالة | Zustand (عميل) + fetch hooks |
| الحركة | Framer Motion |
| قاعدة البيانات | SQLite + Prisma ORM |
| البث | HLS (hls.js) + MP4 احتياطي |
| المصادقة | scrypt + جلسات كوكيز |
| PWA | manifest + service worker (cache-first للصور) |
| أندرويد | TWA عبر bubblewrap |

---

## 🚀 التشغيل محلياً

```bash
# المتطلبات: Node 20+ / Bun 1.1+
bun install                # أو npm install
bun run db:push            # إنشاء قاعدة البيانات
bun scripts/seed.ts        # تعبئة الكتالوج (18 عملاً + باقات + حسابات تجريبية)
bun run dev                # http://localhost:3000
```

متغيرات البيئة (`.env`):
```
DATABASE_URL=file:./db/custom.db
```

## 📦 بناء النسخة الثابتة للعرض (GitHub Pages)

```bash
bash scripts/build-demo.sh   # يبني نسخة عرض ثابتة بوضع DEMO (out/)
```

## 📱 بناء APK أندرويد

```bash
bash scripts/build-apk.sh https://your-domain.com
# ينتج: apk/shasha-app-release-signed.apk
```

التفاصيل الكاملة في `docs/APK-BUILD.md`.

---

## 📁 بنية المشروع

```
├── prisma/schema.prisma        # مخطط قاعدة البيانات
├── scripts/
│   ├── seed.ts                 # تعبئة الكتالوج والباقات والحسابات
│   ├── build-demo.sh           # بناء نسخة العرض الثابتة
│   ├── build-apk.sh            # بناء APK (TWA)
│   ├── gen-next.sh             # توليد الملصقات (z-ai CLI)
│   └── process-images.mjs      # معالجة الصور (sharp)
├── src/
│   ├── app/
│   │   ├── page.tsx / layout.tsx / globals.css
│   │   └── api/                # 11 مسار API (auth/titles/watchlist/progress/plans/subscribe)
│   ├── components/streaming/   # 16 مكوّن واجهة (مشغل، بانر، صفوف، تفاصيل...)
│   └── lib/                    # المتجر، الترجمة، المصادقة، الكتالوج، الأنواع
├── public/
│   ├── posters/  backdrops/  icons/
│   ├── manifest.json  sw.js  offline.html
│   └── .well-known/assetlinks.json   # ربط APK بالموقع (TWA verification)
└── docs/                       # التوثيق
```

---

## 🔐 ملاحظات أمنية مهمة

- كلمات المرور تُخزن بـ **scrypt** مع salt عشوائي لكل مستخدم
- الجلسات **HttpOnly cookies** بصلاحية 30 يوماً مع تنظيف تلقائي
- روابط الفيديو **لا تُكشف إلا بعد فحص الصلاحية** (مجاني/VIP/تسجيل دخول) في `/api/titles/[slug]/play`
- عند الإنتاج: أضف rate-limiting وsigned URLs وDRM (Widevine/FairPlay) وتشفير TLS — راجع `AGENTS.md`

## ⚖️ إخلاء مسؤولية

منصة **شاشة** مشروع تجريبي مستقل **ليس تابعاً لـ iQIYI أو أي علامة تجارية أخرى**. الأفلام القابلة للتشغيل أعمال مفتوحة المصدر مرخّصة من مؤسسة Blender تحت Creative Commons، وبقية العناوين والصور وهمية لأغراض العرض فقط.

---

## 🗺 خارطة الطريق

- [ ] لوحة تحكم إدارية (إدارة المحتوى والمستخدمين والإحصائيات)
- [ ] ربط بوابات دفع جزائرية (CIB / الذهبية / بريدي موب)
- [ ] تطبيق iOS (Same TWA/PWA أو React Native)
- [ ] تحويل فيديو FFmpeg + HLS متعدد الجودات للرفع الذاتي
- [ ] إشعارات Push وتنزيل دون اتصال كامل
- [ ] تطبيقات Smart TV (Android TV / Tizen / webOS)

</div>

---

# SHASHA — Streaming Platform (English)

A complete commercial-grade OTT streaming platform (independent, no third-party branding/content copied) running as **website + PWA + Android app** from one codebase: adaptive HLS player, bilingual Arabic RTL / English UI, accounts, watchlists, resume, VIP subscriptions with server-side entitlement checks, and a bubblewrap TWA APK pipeline.

See the Arabic section above for full details, or `docs/ARCHITECTURE.md`.

**Quick start:** `bun install && bun run db:push && bun scripts/seed.ts && bun run dev`

**Demo accounts:** `demo@shasha.app` (VIP) / `free@shasha.app` — password `demo1234`
