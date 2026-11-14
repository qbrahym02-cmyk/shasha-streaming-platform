<div dir="rtl">

# شاشة | SHASHA — منصة بث متكاملة 🎬

منصة بث فيديو تجارية متكاملة على غرار خدمات OTT العالمية (بدون نسخ أي علامة تجارية أو محتوى محمي) — **موقع ويب بخوادم حقيقية + تطبيق أندرويد أصلي 100% (Kotlin) + تطبيق iOS أصلي 100% (SwiftUI) + PWA**.

![Platform](https://img.shields.io/badge/Platform-Web%20%2B%20Native%20Android%20%2B%20Native%20iOS-00d26a) ![License](https://img.shields.io/badge/License-MIT-e8b923) ![Lang](https://img.shields.io/badge/%D9%84%D8%BA%D8%A9-%D8%B9%D8%B1%D8%A8%D9%8A%20%2B%20English-00d26a)

## 🔗 الروابط الحية

| الوجهة | الرابط |
|---|---|
| 🌐 **الموقع الكامل (خوادم API حقيقية)** | https://shasha-sigma.vercel.app |
| 📱 **تطبيق الأندرويد الأصلي v2.0.0** | `download/shasha-v2.0.0-native.apk` (12 MB) |
| 🛒 حزمة Google Play (.aab) | `download/shasha-v2.0.0-native.aab` |
| 🍎 مشروع تطبيق iOS الأصلي v2.0.0 (SwiftUI) | مجلد `ios/` — يُبنى بـ Xcode 16+ |
| 📄 نسخة العرض الثابتة (GitHub Pages) | https://qbrahym02-cmyk.github.io |

> الإصدار 2.0.0 هو **تطبيق أصلي كامل** (Kotlin + Jetpack Compose + Media3) يتصل بواجهات الموقع على Vercel — لم يعد تغليف ويب (TWA). بما أن مفتاح التوقيع جديد، من ثبت الإصدار القديم 1.0.0 (TWA) عليه إزالته أولًا ثم تثبيت هذا الإصدار.

---

## ✨ ماذا تتضمن المنصة؟

### 🎥 مشغل فيديو احترافي (ويب + أندرويد)
- بث **HLS متكيف** مع جودة تلقائية حسب سرعة الإنترنت + **تبديل يدوي** (تلقائي / 1080p / 720p...)
- سرعة تشغيل (0.5x → 2x)، تخطي ±10 ثوانٍ، ملء الشاشة، **صورة داخل صورة (PiP)**
- **استكمال المشاهدة** من آخر موضع (محفوظ على الخادم) + حفظ دوري كل 5 ثوانٍ
- **تشغيل الحلقة التالية تلقائياً** + قائمة حلقات داخل المشغل (أندرويد)
- مشغل أندرويد: **ExoPlayer/Media3** مع جلسة وسائط (أزرار شاشة القفل) وتبديل تلقائي لمصدر احتياطي عند فشل البث
- مشغل iOS: **AVPlayer** مع تحكم شاشة القفل/مركز التحكم (MPRemoteCommandCenter)، تشغيل خلفي، وPiP
- الويب: ترجمات ومسارات صوتية متعددة (عند توفرها) + اختصارات لوحة مفاتيح كاملة

### 📚 كتالوج وواجهات
- الرئيسية: بانر متحرك، صفوف: تابع المشاهدة / الرائج / حصري VIP / أفلام / مسلسلات
- تصفح بفلاتر (النوع، التصنيف، الترتيب) + **بحث فوري**
- صفحة تفاصيل: خلفية، ملصق، تقييم، تصنيف عمري، حلقات مع أقفال VIP، أعمال مشابهة
- **عربية RTL + إنجليزية LTR** — على الويب وفي التطبيق الأصلي (تبديل فوري للغة التطبيق)

### 👤 حسابات واشتراكات
- تسجيل/دخول بالبريد — على Vercel بجلسات **موقّعة HMAC** بلا قاعدة بيانات، وفي الاستضافة الذاتية بـ scrypt + SQLite
- **قائمة المفضلة** و**سجل المشاهدة** متزامنان عبر كل أجهزة التطبيق والويب (عبر الخادم)
- **عضوية VIP** مع بوابات قفل محتوى، باقات (شهري/6 أشهر/سنوي بالدينار الجزائري)، تفعيل تجريبي فوري
- فحص الصلاحيات **من طرف الخادم** قبل كشف روابط الفيديو — في كل الأوضاع

### 📱 تطبيق الأندرويد الأصلي (جديد في v2.0.0)
- **Kotlin + Jetpack Compose (Material 3)** — واجهة أصلية بالكامل بخط Tajawal العربي
- بنية MVVM نظيفة: Retrofit + OkHttp (حفظ الجلسات) + kotlinx.serialization + Coil
- مشغل **Media3/ExoPlayer**: جودة يدوية، سرعة، PiP تلقائي (أندرويد 12+)، استئناف، حلقات
- شاشة بداية (Splash)، أيقونات تكيفية، وضع داكن بهوية العلامة (أسود + زمردي + ذهبي)
- `minSdk 24` (أندرويد 7.0+) — يدعم +99% من الأجهزة

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
| موقع الويب | Next.js 16 (App Router) + TypeScript + Tailwind CSS 4 + shadcn/ui |
| تطبيق الأندرويد | **Kotlin + Jetpack Compose + Media3/ExoPlayer + Retrofit** |
| خادم الإنتاج (Vercel) | Next.js API Routes بوضع **serverless بلا قاعدة بيانات** (جلسات وكوكيز موقّعة HMAC-SHA256) |
| خادم الاستضافة الذاتية | SQLite + Prisma ORM + scrypt |
| البث | HLS (hls.js للموبايل/الويب، ExoPlayer للأندرويد) + MP4 احتياطي |
| PWA | manifest + service worker (cache-first للصور) |

### 🧩 أوضاع التشغيل الثلاثة
1. **وضع Vercel (serverless)**: `SERVERLESS=1` — كل الـ API تعمل بدون أي قاعدة بيانات: الكتالوج من ملف JSON، والمصادقة والاشتراكات والمفضلة والتقدم داخل كوكيز موقّعة (تتحقق منها كل نسخة دالة). مناسب للنشر المجاني على Vercel.
2. **وضع قاعدة البيانات (استضافة ذاتية)**: Prisma + SQLite كامل الميزات (حسابات دائمة عبر الأجهزة).
3. **وضاع العرض الثابت (GitHub Pages)**: `BUILD_DEMO=1` — كل شيء يعمل من localStorage.

---

## 🚀 التشغيل محلياً (موقع الويب)

```bash
# المتطلبات: Node 20+ / Bun 1.1+
bun install                # أو npm install
bun run db:push            # إنشاء قاعدة البيانات (وضع قاعدة البيانات فقط)
bun scripts/seed.ts        # تعبئة الكتالوج (18 عملاً + باقات + حسابات تجريبية)
bun run dev                # http://localhost:3000
```

متغيرات البيئة:
```
DATABASE_URL=file:./db/custom.db     # وضع قاعدة البيانات
SERVERLESS=1                          # وضع serverless (اختياري)
AUTH_SECRET=<مفتاح عشوائي>            # توقيع الجلسات (وضع serverless)
```

## 📱 بناء تطبيق الأندرويد الأصلي

```bash
cd android
# المتطلبات: JDK 17+ و Android SDK (platforms;android-35 + build-tools;35.0.0)
gradle assembleRelease    # ينتج app-release.apk (موقّع إن وُجد android-signing/shasha.keystore)
gradle bundleRelease      # ينتج app-release.aab لمتجر Google Play
```

- عنوان الـ API مضمّن في `android/app/build.gradle.kts` (`API_BASE`) — غيّره إذا نشرت على نطاق آخر.
- **مفتاح التوقيع** (`android-signing/shasha.keystore`) غير مضمّن في المستودع — احتفظ به؛ بدونه لا يمكن تحديث التطبيق لنفس المستخدمين (نفس اسم الحزمة `com.shasha.app`).

## 🌐 النشر على Vercel

المشروع جاهز للنشر مباشرة: اربط المستودع بـ Vercel أو انشر عبر `vercel --prod`، ثم أضف متغيرات البيئة `SERVERLESS=1` و `AUTH_SECRET` (و `DATABASE_URL=file:./dev.db`).

## 📄 بناء النسخة الثابتة للعرض (GitHub Pages)

```bash
bash scripts/build-demo.sh   # يبني نسخة عرض ثابتة بوضع DEMO (out/)
```

---

## 📁 بنية المشروع

```
├── android/                    # ★ تطبيق الأندرويد الأصلي (Kotlin + Compose)
│   └── app/src/main/java/com/shasha/app/
│       ├── data/               # Retrofit + OkHttp + الجلسات + المستودع
│       ├── ui/screens/         # 9 شاشات (رئيسية، بحث، تفاصيل، مشغل، VIP...)
│       ├── ui/components/      # مكونات مشتركة (بطاقات، بانر، shimmer)
│       └── ui/theme|icons/     # هوية العلامة + أيقونات مخصصة
├── prisma/schema.prisma        # مخطط قاعدة البيانات (وضع الاستضافة الذاتية)
├── scripts/                    # seed + build-demo + أيقونات الأندرويد
├── src/
│   ├── app/api/                # 12 مسار API (auth/titles/play/watchlist/progress/subscribe)
│   ├── components/streaming/   # واجهة الويب (16 مكوّن)
│   └── lib/
│       ├── stateless.ts        # ★ وضع serverless (جلسات موقّعة HMAC)
│       ├── db.ts               # Prisma (كسول التحميل)
│       └── demo-api.ts         # وضع العرض الثابت (localStorage)
├── public/posters|backdrops|icons
└── docs/                       # التوثيق
```

---

## 🔐 ملاحظات أمنية مهمة

- الجلسات في وضع serverless **كوكيز HttpOnly موقّعة HMAC-SHA256** بصلاحية 30 يومًا — لا يمكن تزويرها أو تعديل حالة VIP من العميل
- في وضع قاعدة البيانات: كلمات المرور بـ **scrypt** مع salt عشوائي لكل مستخدم
- روابط الفيديو **لا تُكشف إلا بعد فحص الصلاحية** (مجاني/VIP/تسجيل دخول) في `/api/titles/[slug]/play` — في كل الأوضاع
- **مفاتيح API (Vercel/GitHub) لا تُحفظ في المستودع** — إن تسربت في محادثة، ألغها فورًا وأنشئ غيرها
- عند الإنتاج: أضف rate-limiting و signed URLs و DRM (Widevine/FairPlay)

## ⚖️ إخلاء مسؤولية

منصة **شاشة** مشروع تجريبي مستقل **ليس تابعًا لـ iQIYI أو أي علامة تجارية أخرى**. الأفلام القابلة للتشغيل أعمال مفتوحة المصدر مرخّصة من مؤسسة Blender تحت Creative Commons، وبقية العناوين والصور وهمية لأغراض العرض فقط.

---

## 🗺 خارطة الطريق

- [ ] لوحة تحكم إدارية (إدارة المحتوى والمستخدمين والإحصائيات)
- [ ] ربط بوابات دفع جزائرية (CIB / الذهبية / بريدي موب)
- [x] تطبيق iOS أصلي (SwiftUI) — مجلد `ios/` بـ Xcode 16+ (AVPlayer + PiP + تشغيل خلفي + عربي/إنجليزي)
- [ ] تحويل فيديو FFmpeg + HLS متعدد الجودات للرفع الذاتي
- [ ] إشعارات Push (FCM) وتنزيل دون اتصال داخل التطبيق الأصلي
- [ ] تطبيقات Smart TV (Android TV / Tizen / webOS)

</div>

---

# SHASHA — Streaming Platform (English)

A complete commercial-grade OTT streaming platform (independent, no third-party branding/content copied): **full server-backed website (Vercel) + 100% native Android app (Kotlin + Jetpack Compose + Media3/ExoPlayer) + PWA**.

- **Live site:** https://shasha-sigma.vercel.app — real API servers, server-side VIP entitlement checks, HMAC-signed stateless sessions (no DB required on serverless).
- **Native Android v2.0.0:** adaptive HLS playback, manual quality switching, PiP, episodes, resume sync, bilingual AR/EN with per-app locale switching, Material 3 dark brand theme.
- **Demo accounts:** `demo@shasha.app` (VIP) / `free@shasha.app` — password `demo1234`

See the Arabic section above for full details, or `docs/ARCHITECTURE.md`.

**Quick start (web):** `bun install && bun run db:push && bun scripts/seed.ts && bun run dev`
**Quick start (Android):** `cd android && gradle assembleRelease`
