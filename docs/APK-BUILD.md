<div dir="rtl">

# بناء تطبيق الأندرويد الأصلي — شاشة v2.0.0

> ابتداءً من الإصدار 2.0.0 أصبح التطبيق **أصليًا 100%** (Kotlin + Jetpack Compose) ولم يعد TWA.
> توثيق النسخة القديمة (bubblewrap TWA) في أسفل الملف للأرشفة.

## المتطلبات

- JDK 17 أو أحدث
- Android SDK: `platforms;android-35` + `build-tools;35.0.0` (متغير `ANDROID_HOME`)
- Gradle 8.11+ (أو استخدم Gradle Wrapper)

## البناء

```bash
cd android

# عنوان الـ API (غيّره إذا نشرت الموقع على نطاق آخر)
# android/app/build.gradle.kts -> buildConfigField("String", "API_BASE", ...)

gradle assembleRelease   # app/build/outputs/apk/release/app-release.apk
gradle bundleRelease     # app/build/outputs/bundle/release/app-release.aab (لمتجر Google Play)
```

## التوقيع

- ملف المفتاح المتوقع: `android-signing/shasha.keystore` (بمحاذاة مجلد `android/`) — **غير مضمّن في المستودع**.
- عند وجوده يوقّع Gradle نسخة الإصدار تلقائيًا؛ وعند غيابه تُنتج نسخة غير موقّعة (لتوزيع داخل الفريق فقط).
- لتوليد مفتاح جديد:
```bash
keytool -genkeypair -keystore android-signing/shasha.keystore -alias shasha \
  -keyalg RSA -keysize 2048 -validity 10950
```
- **احتفظ بالمفتاح وكلمة المرور بأمان** — بدونها لا يمكن إصدار تحديث بنفس هوية التطبيق (`com.shasha.app`).
- ملاحظة ترقية: v2.0.0 موقّع بمفتاح جديد، لذا من لديه v1.0.0 (TWA) عليه إزالته قبل التثبيت.

## بنية المشروع

```
android/app/src/main/java/com/shasha/app/
├── ShashaApp.kt          # تهيئة التطبيق (API/جلسة/لغة)
├── MainActivity.kt       # نشاط واحد + التنقل + PiP
├── data/
│   ├── Models.kt         # نماذج kotlinx.serialization (تطابق API الويب)
│   ├── Api.kt            # Retrofit + OkHttp + حفظ كوكيز الجلسة
│   ├── Session.kt        # حالة المستخدم (StateFlow)
│   └── Repo.kt           # كل نداءات API
├── ui/
│   ├── screens/          # Home, Search, Browse, Details, Player, VIP, Profile, Watchlist, Auth
│   ├── components/       # بطاقات، بانر، shimmer، أخطاء
│   ├── icons/            # أيقونات SVG مخصصة (تاج VIP، عين، إلخ)
│   └── theme/            # ألوان العلامة + خط Tajawal
└── res/                  # نصوص ar (افتراضي) + en، أيقونات تكيفية بكل الكثافات
```

## الميزات المضمنة

- مشغل Media3/ExoPlayer: HLS متكيف + جودة يدوية + سرعة + PiP (أندرويد 12+ تلقائي) + MediaSession
- استئناف المشاهدة وحفظ التقدم على الخادم كل 5 ثوانٍ + عند الخروج
- تشغيل تلقائي للحلقة التالية + لوحة حلقات
- تسجيل دخول/إنشاء حساب + حسابات تجريبية بضغطة زر
- VIP: باقات + تفعيل تجريبي + إلغاء — الحماية من طرف الخادم
- تبديل لغة التطبيق عربي/إنجليزي فوري (AppCompat per-app locales)
- عربي RTL افتراضيًا مع دعم كامل للاتجاه

---

# أرشيف: بناء TWA القديم (v1.0.0)

النسخة القديمة كانت تغليفًا للويب (Trusted Web Activity) عبر bubblewrap:

```bash
bash scripts/build-apk.sh https://your-domain.com
```

</div>
