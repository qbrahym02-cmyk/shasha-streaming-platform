import Foundation

// ============================================================
// نماذج البيانات — مطابقة تماماً لعقد واجهة برمجة التطبيقات
// ============================================================

// ===== المستخدم =====
struct User: Codable, Equatable {
    var id: String = ""
    var email: String = ""
    var name: String = ""
    var avatarColor: String = "#00d26a"
    var isVip: Bool = false
    var vipUntil: String? = nil
}

// ===== التصنيفات =====
struct Genre: Codable, Equatable, Identifiable {
    var id: String { slug }
    var slug: String = ""
    var nameAr: String = ""
    var nameEn: String = ""
}

// ===== العمل (فيلم/مسلسل) =====
struct Title: Codable, Equatable, Identifiable {
    var id: String = ""
    var slug: String = ""
    var type: String = "MOVIE"
    var titleAr: String = ""
    var titleEn: String = ""
    var synopsisAr: String? = nil
    var synopsisEn: String? = nil
    var poster: String = ""
    var backdrop: String? = nil
    var year: Int? = nil
    var ageRating: String? = nil
    var score: Double? = nil
    var durationMin: Int? = nil
    var isPremium: Bool = false
    var releaseState: String = "released"
    var trending: Int? = nil
    var featured: Bool? = nil
    var genres: [Genre] = []
    // تفاصيل فقط
    var episodes: [Episode] = []
    var similar: [Title] = []
    var canPlayVip: Bool = false
    // حالة المستخدم
    var inWatchlist: Bool = false
    var progressPct: Double = 0.0
    var progressPositionSec: Double = 0.0
    var progressDurationSec: Double = 0.0
    var progressEpisodeId: String? = nil

    var isSeries: Bool { type == "SERIES" }
    var isReleased: Bool { releaseState == "released" }

    /// العنوان حسب اللغة الحالية
    func name(_ ar: Bool) -> String { ar ? titleAr : (titleEn.isEmpty ? titleAr : titleEn) }
    func synopsis(_ ar: Bool) -> String {
        if ar { return synopsisAr ?? synopsisEn ?? "" }
        return synopsisEn ?? synopsisAr ?? ""
    }
}

// ===== الحلقة =====
struct Episode: Codable, Equatable, Identifiable {
    var id: String = ""
    var season: Int = 1
    var number: Int = 1
    var nameAr: String = ""
    var nameEn: String = ""
    var durationMin: Int? = nil
    var isPremium: Bool = false

    func name(_ ar: Bool) -> String {
        let base = ar ? nameAr : (nameEn.isEmpty ? nameAr : nameEn)
        return base.isEmpty ? (ar ? "حلقة \(number)" : "Episode \(number)") : base
    }
}

// ===== مصدر التشغيل =====
struct PlaySource: Codable, Equatable {
    var sourceType: String? = nil
    var sourceUrl: String = ""
    var fallbackUrl: String? = nil
    var titleSlug: String = ""
    var titleAr: String = ""
    var titleEn: String = ""
    var episodeId: String? = nil
    var episodeNameAr: String? = nil
    var episodeNameEn: String? = nil
    var episodes: [Episode] = []
    var nextEpisodeId: String? = nil
    var resumeAt: Double = 0.0
}

// ===== الباقات =====
struct Plan: Codable, Equatable, Identifiable {
    var id: String { code }
    var code: String = ""
    var nameAr: String = ""
    var nameEn: String = ""
    var priceDzd: Double = 0.0
    var originalDzd: Double? = nil
    var months: Int = 1
    var featuresAr: [String] = []
    var featuresEn: [String] = []
    var highlight: Bool = false

    func name(_ ar: Bool) -> String { ar ? nameAr : (nameEn.isEmpty ? nameAr : nameEn) }
    func features(_ ar: Bool) -> [String] { ar ? featuresAr : featuresEn }
}

// ===== أغلفة الاستجابات =====
struct ApiErrorBody: Codable {
    var ok: Bool = false
    var error: String? = nil
    var code: String? = nil
}

struct TitlesResponse: Codable {
    var ok: Bool = false
    var data: [Title] = []
    var error: String? = nil
}

struct TitleResponse: Codable {
    var ok: Bool = false
    var data: Title? = nil
    var error: String? = nil
    var code: String? = nil
}

struct PlayResponse: Codable {
    var ok: Bool = false
    var data: PlaySource? = nil
    var error: String? = nil
    var code: String? = nil
}

struct GenresResponse: Codable {
    var ok: Bool = false
    var data: [Genre] = []
}

struct PlansResponse: Codable {
    var ok: Bool = false
    var data: [Plan] = []
}

struct MeResponse: Codable {
    var ok: Bool = false
    var user: User? = nil
}

struct UserBody: Codable { var user: User? = nil }

struct UserResponse: Codable {
    var ok: Bool = false
    var data: UserBody? = nil
    var error: String? = nil
}

struct InWatchBody: Codable { var inWatchlist: Bool = false }

struct WatchResponse: Codable {
    var ok: Bool = false
    var data: InWatchBody? = nil
}

struct ProgressEntry: Codable {
    var episodeId: String? = nil
    var positionSec: Double = 0.0
    var durationSec: Double = 0.0
}

struct ProgressBody: Codable {
    var list: [Title] = []
    var single: ProgressEntry? = nil
}

struct ProgressResponse: Codable {
    var ok: Bool = false
    var data: ProgressBody? = nil
}

struct SubscribeBody: Codable {
    var user: User? = nil
    var expiresAt: String? = nil
}

struct SubscribeResponse: Codable {
    var ok: Bool = false
    var data: SubscribeBody? = nil
    var error: String? = nil
}

// ===== أجسام الطلبات =====
struct LoginRequest: Codable {
    var email: String
    var password: String
}

struct RegisterRequest: Codable {
    var email: String
    var name: String
    var password: String
}

struct SlugRequest: Codable { var slug: String }

struct ProgressRequest: Codable {
    var slug: String
    var episodeId: String? = nil
    var positionSec: Double = 0.0
    var durationSec: Double = 0.0
}

struct PlanRequest: Codable { var planCode: String }

// ===== نتيجة موحدة للشبكة =====
enum Net<T> {
    case ok(T)
    case err(message: String, code: String?)
}

let NET_CODE_NETWORK = "network"
