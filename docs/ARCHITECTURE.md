<div dir="rtl">

# معمارية منصة شاشة

## نظرة عامة

```
┌─────────────────────────────────────────────────┐
│                العميل (واجهة واحدة)              │
│   Next.js 16 SPA — توجيه بالهاش (#/t/:slug ...)  │
│   PWA: manifest + sw.js (كاش الصور والأصول)      │
├─────────────────────────────────────────────────┤
│  المكوّنات: Header / Hero / Rows / Details /     │
│  Player (hls.js) / Plans / Watchlist / Auth      │
├─────────────────────────────────────────────────┤
│  Zustand store (اللغة، المستخدم، العرض الحالي)   │
├─────────────────────────────────────────────────┤
│                 API Routes (خادم)                │
│  /api/auth/*  /api/titles/*  /api/watchlist     │
│  /api/progress  /api/plans  /api/subscribe       │
├─────────────────────────────────────────────────┤
│        Prisma ORM ← SQLite (db/custom.db)        │
└─────────────────────────────────────────────────┘
          │
          ▼ (بعد فحص الصلاحية فقط)
   مصادر HLS/MP4 خارجية (CDN) ← hls.js
```

## تدفق تشغيل الفيديو (الأهم أمنياً)

1. المستخدم يضغط "شاهد الآن" ← `#/watch/:slug?e=:ep`
2. المشغل يستدعي `GET /api/titles/:slug/play?e=:ep`
3. الخادم يفحص: متوفر؟ ← مجاني أو VIP؟ ← مسجّل؟ ← مشترك VIP فعّال؟
4. عند نجاح الفحص فقط تُعاد `{ sourceUrl, fallbackUrl, resumeAt, episodes, nextEpisodeId }`
5. المشغل يبني HLS عبر hls.js (مع تراجع تلقائي إلى MP4 عند فشل البث)
6. يُحفظ التقدم كل 8 ثوانٍ + عند الإيقاف + عند الخروج في `watch_progress`

## نماذج قاعدة البيانات

| الجدول | الغرض |
|---|---|
| User / Session | الحسابات والجلسات (كوكيز HttpOnly) |
| Title / Episode / Genre / TitleGenre | الكتالوج |
| WatchlistItem | المفضلة |
| WatchProgress | مواضع المشاهدة (استكمال) |
| Plan / Subscription | باقات VIP والاشتراكات |

## نظام VIP

- `User.vipUntil` يحدد العضوية (`isVip = vipUntil > now`)
- قفل على مستوى العمل (`Title.isPremium`) وعلى مستوى الحلقة (`Episode.isPremium`)
- الاشتراك التجريبي: `POST /api/subscribe` يمدد `vipUntil` ويسجل `Subscription`
- عند الإطلاق: استبدال ببوابات دفع حقيقية + Webhooks تحقق

## وضع العرض الثابت (DEMO_MODE)

`scripts/build-demo.sh` يبني نسخة ثابتة (static export) تعمل على GitHub Pages:
- الكتالوج مجمّع مسبقاً من قاعدة البيانات (`src/lib/demo-data.json`)
- المصادقة/المفضلة/التقدم/اشتراك VIP محاكاة محلياً (localStorage)
- نفس الواجهات والمشغل — للتعرّف على المنتج بدون خادم

## الأمان في الإنتاج (قائمة تحقق)

- [ ] HTTPS إجباري + HSTS + كوكيز Secure
- [ ] Rate limiting (تسجيل الدخول، الـ API)
- [ ] روابط بث موقّعة ومنتهية الصلاحية (signed URLs)
- [ ] DRM (Widevine/FairPlay/PlayReady) للمحتوى المدفوع
- [ ] فحوصات OWASP API Top 10 + مراجعة دورية
- [ ] نسخ احتياطي يومي لقاعدة البيانات + سجلات تدقيق

</div>
