# شاشة SHASHA — تطبيق iOS الأصلي

تطبيق iPhone/iPad أصلي 100% مكتوب بـ **SwiftUI** — ليس غلافاً لموقع، بل تطبيق حقيقي كامل الميزات، يرتبط بنفس خادم المنصة على Vercel.

## الميزات

| الميزة | التفاصيل |
|---|---|
| مشغل AVPlayer | بث HLS متكيف تلقائياً مع سرعة الشبكة |
| تحكم كامل | تشغيل/إيقاف، سحب ±10 ثوانٍ، شريط تقدم تفاعلي |
| الجودة | تلقائي / 1080p / 720p / 480p / 360p (تحكم بـ preferredPeakBitRate) |
| السرعة | 0.5x حتى 2x |
| PiP | صورة داخل صورة على iOS 16+ |
| شاشة القفل | تحكم كامل من مركز التحكم وشاشة القفل (MPRemoteCommandCenter) |
| تشغيل خلفي | يستمر الصوت عند الخروج من التطبيق (UIBackgroundModes: audio) |
| استئناف المشاهدة | يحفظ الموضع كل 15 ثانية ويستأنف من حيث توقفت |
| الحلقة التالية | انتقال تلقائي عند نهاية الحلقة + قائمة حلقات كاملة |
| VIP | عرض الباقات، اشتراك تجريبي، إلغاء، محتوى حصري |
| الحساب | تسجيل دخول/إنشاء حساب + حسابات تجريبية جاهزة |
| اللغة | عربي RTL افتراضي + إنجليزي بتبديل فوري (خط Tajawal) |
| قائمتي | حفظ الأعمال ومتابعتها |
| التصنيفات | تصفح بمرشحات النوع/التصنيف/الترتيب |
| الأمان | مصادقة بكوكيز موقّعة HMAC — مثل الويب وأندرويد تماماً |

## البنية

```
ios/
├── SHASHA.xcodeproj/          ← مشروع Xcode 16+ (مجموعات متزامنة)
└── SHASHA/
    ├── SHASHAApp.swift         نقطة الدخول + جلسة الصوت
    ├── Models.swift            نماذج Codable مطابقة لعقد API
    ├── APIClient.swift         URLSession + إدارة كوكيز الجلسة
    ├── SessionStore.swift      حالة المستخدم + اللغة + التوطين
    ├── Router.swift            تنقل مستقل لكل تبويب
    ├── Theme.swift             ألوان العلامة + خط Tajawal
    ├── Components.swift        مكونات مشتركة (بطاقات/شارات/صور)
    ├── Screens/
    │   ├── RootView.swift      التبويبات الأربعة
    │   ├── HomeScreen.swift    بطل دوّار + صفوف المحتوى
    │   ├── SearchScreen.swift  بحث فوري مؤجل
    │   ├── BrowseScreen.swift  تصفح بمرشحات
    │   ├── DetailsScreen.swift تفاصيل + حلقات + مشابهة
    │   ├── PlayerScreen.swift  المشغل الكامل
    │   ├── VipScreen.swift     الباقات والاشتراك
    │   ├── ProfileScreen.swift الحساب والإعدادات
    │   ├── WatchlistScreen.swift قائمتي
    │   └── AuthScreen.swift    دخول/تسجيل
    ├── Assets.xcassets/        الأيقونة واللون المميز
    ├── Resources/fonts/        خط Tajawal (3 أوزان)
    └── Info.plist
```

## البناء

### المتطلبات
- Mac بـ macOS 14.5+
- Xcode 16 أو أحدث
- iOS 16.0+ كحد أدنى للأجهزة

### الخطوات

1. افتح `ios/SHASHA.xcodeproj` في Xcode.
2. من إعدادات المشروع → تبويب **Signing & Capabilities**:
   - فعّل **Automatically manage signing**
   - اختر فريقك (حساب Apple Developer مجاني يكفي للتشغيل على جهازك)
   - بدّل الـ Bundle Identifier `dz.shasha.app` إن كان مستخدماً
3. صِل جهاز iPhone واضغط **Cmd+R** للتشغيل.

### النشر على App Store (اختياري)
- Product → Archive → Distribute App
- يتطلب حساب Apple Developer Program ($99/سنة)

## ملاحظات تقنية

- **الخادم**: `https://shasha-sigma.vercel.app` (نشر Vercel بوضع serverless — عيّنه من `APIClient.base`).
- **حسابات تجريبية**: `demo@shasha.app` (VIP) و `free@shasha.app` — كلمة المرور `demo1234`.
- المشغل يعالج أخطاء الصلاحيات: `auth_required` (اطلب الدخول) و `vip_required` (اعرض الباقات).
- لا توجد مكتبات خارجية — كل شيء بأطر Apple الأصلية.

## الترخيص

نفس ترخيص المستودع الرئيسي.
