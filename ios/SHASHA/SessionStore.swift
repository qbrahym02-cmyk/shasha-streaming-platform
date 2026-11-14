import Foundation
import SwiftUI

// ============================================================
// حالة الجلسة — المستخدم + اللغة + إشعارات التغيير
// ============================================================

@MainActor
final class SessionStore: ObservableObject {
    static let shared = SessionStore()

    @Published var user: User?
    @Published var loaded: Bool = false
    @AppStorage("shasha_lang") private var langRaw: String = "ar"

    var isArabic: Bool { langRaw == "ar" }

    var isLoggedIn: Bool { user != nil }
    var isVip: Bool { user?.isVip ?? false }

    private init() {
        // استرجاع المستخدم المخزّن محلياً (تسجيل دخول سريع)
        if let data = UserDefaults.standard.data(forKey: "shasha_user_cache"),
           let cached = try? JSONDecoder().decode(User.self, from: data) {
            user = cached
        }
    }

    // MARK: - اللغة

    func setLanguage(_ arabic: Bool) {
        langRaw = arabic ? "ar" : "en"
        UserDefaults.standard.set([arabic ? "ar" : "en"], forKey: "AppleLanguages")
        objectWillChange.send()
    }

    // MARK: - التهيئة

    func bootstrap() async {
        let result = await APIClient.shared.me()
        switch result {
        case .ok(let resp):
            if let u = resp.user {
                user = u
                cacheUser(u)
            } else {
                user = nil
                clearCache()
            }
        case .err:
            // ابق على الحالة المخزنة — ربما لا اتصال
            break
        }
        loaded = true
    }

    func login(email: String, password: String) async -> Net<User> {
        let result = await APIClient.shared.login(email: email, password: password)
        if case .ok(let resp) = result, let u = resp.data?.user {
            user = u
            cacheUser(u)
            return .ok(u)
        }
        if case .err(let message, let code) = result {
            return .err(message: message, code: code)
        }
        return .err(message: "unknown", code: nil)
    }

    func register(email: String, name: String, password: String) async -> Net<User> {
        let result = await APIClient.shared.register(email: email, name: name, password: password)
        if case .ok(let resp) = result, let u = resp.data?.user {
            user = u
            cacheUser(u)
            return .ok(u)
        }
        if case .err(let message, let code) = result {
            return .err(message: message, code: code)
        }
        return .err(message: "unknown", code: nil)
    }

    func logout() async {
        _ = await APIClient.shared.logout()
        APIClient.shared.clearCookies()
        user = nil
        clearCache()
    }

    func refreshAfterVip(_ newUser: User?) {
        guard let newUser else { return }
        user = newUser
        cacheUser(newUser)
    }

    // MARK: - التخزين المحلي

    private func cacheUser(_ u: User) {
        if let data = try? JSONEncoder().encode(u) {
            UserDefaults.standard.set(data, forKey: "shasha_user_cache")
        }
    }

    private func clearCache() {
        UserDefaults.standard.removeObject(forKey: "shasha_user_cache")
    }
}

// ============================================================
// التوطين — عربي/إنجليزي بنفس مفاتيح نسخة أندرويد
// ============================================================

@MainActor
func tr(_ key: String) -> String {
    let ar = SessionStore.shared.isArabic
    return tr(key, ar)
}

func tr(_ key: String, _ ar: Bool) -> String {
    let table: [String: (ar: String, en: String)] = [
        // التنقل
        "tab_home": ("الرئيسية", "Home"),
        "tab_search": ("بحث", "Search"),
        "tab_vip": ("VIP", "VIP"),
        "tab_profile": ("حسابي", "Profile"),
        // عام
        "watch_now": ("شاهد الآن", "Watch now"),
        "details": ("التفاصيل", "Details"),
        "my_list": ("قائمتي", "My list"),
        "add_to_list": ("أضِف لقائمتي", "Add to my list"),
        "in_list": ("في قائمتي", "In my list"),
        "continue_watching": ("تابع المشاهدة", "Continue watching"),
        "trending": ("الأكثر رواجًا", "Trending now"),
        "newest": ("أحدث الإضافات", "New releases"),
        "vip_section": ("مختارات VIP", "VIP picks"),
        "movies": ("أفلام", "Movies"),
        "series": ("مسلسلات", "Series"),
        "all": ("الكل", "All"),
        "retry": ("إعادة المحاولة", "Retry"),
        "cancel": ("إلغاء", "Cancel"),
        "error_generic": ("حدث خطأ ما، حاول مجددًا", "Something went wrong, try again"),
        "error_network": ("تعذر الاتصال بالخادم، تحقق من الإنترنت", "Cannot reach the server, check your connection"),
        "no_results": ("لا توجد نتائج مطابقة", "No matching results"),
        "minutes": ("دقيقة", "min"),
        "loading": ("جارٍ التحميل…", "Loading…"),
        // البحث
        "search_hint": ("ابحث عن فيلم أو مسلسل…", "Search movies or series…"),
        "search_empty": ("ابدأ بالكتابة لعرض النتائج", "Start typing to see results"),
        // التصفح
        "browse": ("تصفح", "Browse"),
        "sort_popular": ("الأعلى تقييمًا", "Top rated"),
        "sort_newest": ("الأحدث", "Newest"),
        // المصادقة
        "login": ("تسجيل الدخول", "Sign in"),
        "register": ("إنشاء حساب", "Create account"),
        "logout": ("تسجيل الخروج", "Sign out"),
        "email": ("البريد الإلكتروني", "Email"),
        "password": ("كلمة المرور", "Password"),
        "full_name": ("الاسم الكامل", "Full name"),
        "no_account": ("ليس لديك حساب؟ أنشئ حسابًا", "No account? Create one"),
        "have_account": ("لديك حساب؟ سجّل الدخول", "Have an account? Sign in"),
        "demo_accounts": ("حسابات تجريبية جاهزة", "Ready demo accounts"),
        "guest": ("زائر", "Guest"),
        "login_to_continue": ("سجّل الدخول للمتابعة", "Sign in to continue"),
        "logout_confirm": ("هل تريد تسجيل الخروج؟", "Do you want to sign out?"),
        // VIP
        "vip_title": ("عضوية شاشة VIP", "SHASHA VIP membership"),
        "vip_subtitle": ("افتح كل المحتوى الحصري بجودة عالية وبدون إعلانات", "Unlock all exclusive content in high quality, ad-free"),
        "vip_active": ("عضويتك VIP فعّالة", "Your VIP membership is active"),
        "vip_active_until": ("فعّالة حتى %@", "Active until %@"),
        "vip_cancel": ("إلغاء العضوية", "Cancel membership"),
        "activate": ("اشترك الآن", "Subscribe now"),
        "dzd": ("دج", "DZD"),
        "per_six_months": ("لستة أشهر", "per 6 months"),
        "payment_demo_note": ("دفع تجريبي — لن يُخصم أي مبلغ حقيقي", "Demo payment — no real charge"),
        "vip_success": ("تم تفعيل عضوية VIP بنجاح", "VIP membership activated"),
        "vip_cancelled": ("تم إلغاء العضوية", "Membership cancelled"),
        // الحساب
        "settings": ("الإعدادات", "Settings"),
        "language": ("اللغة", "Language"),
        "arabic": ("العربية", "العربية"),
        "english": ("English", "English"),
        "about": ("عن التطبيق", "About"),
        "version": ("الإصدار", "Version"),
        "desc_profile": ("إدارة حسابك ومشاهداتك وعضويتك", "Manage your account, watchlist and membership"),
        // التفاصيل
        "episodes": ("الحلقات", "Episodes"),
        "episode": ("حلقة %d", "Episode %d"),
        "season": ("موسم %d", "Season %d"),
        "similar": ("أعمال مشابهة", "Similar titles"),
        "synopsis": ("القصة", "Synopsis"),
        "coming_soon": ("قريبًا", "Coming soon"),
        "coming_soon_msg": ("هذا العمل لم يتوفر بعد — ترقّب إطلالته", "Not yet available — stay tuned"),
        "vip_badge": ("VIP", "VIP"),
        "premium_content": ("محتوى VIP", "VIP content"),
        "free_content": ("مجاني", "Free"),
        // المشغل
        "next_episode": ("الحلقة التالية", "Next episode"),
        "quality": ("الجودة", "Quality"),
        "quality_auto": ("تلقائي", "Auto"),
        "speed": ("السرعة", "Speed"),
        "player_error_vip": ("هذا المحتوى متاح لمشتركي VIP فقط", "This content is for VIP subscribers only"),
        "player_error_auth": ("سجّل الدخول أولاً لمشاهدة هذا المحتوى", "Sign in first to watch this content"),
        "player_error_source": ("تعذر تحميل مصدر الفيديو", "Could not load the video source"),
        "go_vip": ("اطّلع على الباقات", "See plans"),
    ]
    guard let entry = table[key] else { return key }
    return ar ? entry.ar : entry.en
}

/// استبدال بسيط لـ %@ و %d في الترجمة
func trFmt(_ key: String, _ args: [CVarArg]) -> String {
    let ar = SessionStore.shared.isArabic
    var s = tr(key, ar)
    for arg in args {
        if let range = s.range(of: "%@") {
            s.replaceSubrange(range, with: String(describing: arg))
        } else if let range = s.range(of: "%d") {
            s.replaceSubrange(range, with: String(describing: arg))
        }
    }
    return s
}
