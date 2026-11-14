import Foundation

// ============================================================
// طبقة الشبكة — URLSession مع حفظ كوكيز الجلسة الموقّعة HMAC
// (مرآة لسلوك OkHttp interceptor في نسخة أندرويد)
// ============================================================

final class APIClient {
    static let shared = APIClient()

    /// عنوان الخادم الإنتاجي (نشر Vercel بوضع serverless)
    static let base = "https://shasha-sigma.vercel.app"

    private let session: URLSession
    private let defaults = UserDefaults.standard
    private let cookieKey = "shasha_cookies"

    private let decoder: JSONDecoder = {
        let d = JSONDecoder()
        return d
    }()

    private let encoder: JSONEncoder = {
        let e = JSONEncoder()
        return e
    }()

    private init() {
        let config = URLSessionConfiguration.ephemeral
        config.timeoutIntervalForRequest = 25
        config.timeoutIntervalForResource = 45
        config.httpAdditionalHeaders = ["Accept": "application/json"]
        session = URLSession(configuration: config)
    }

    // MARK: - إدارة الكوكيز

    private var storedCookies: String {
        get { defaults.string(forKey: cookieKey) ?? "" }
        set { defaults.set(newValue, forKey: cookieKey) }
    }

    func clearCookies() {
        storedCookies = ""
    }

    private func parseCookies(_ header: String) -> [String: String] {
        var map: [String: String] = [:]
        for pair in header.split(separator: "; ") where pair.contains("=") {
            let parts = pair.split(separator: "=", maxSplits: 1)
            guard parts.count == 2 else { continue }
            map[String(parts[0])] = String(parts[1])
        }
        return map
    }

    private func absorbSetCookies(_ response: HTTPURLResponse) {
        let raws: [String] = response.allHeaderFields
            .filter { ($0.key as? String)?.lowercased() == "set-cookie" }
            .values
            .compactMap { $0 as? String }
        guard !raws.isEmpty else { return }
        var map = parseCookies(storedCookies)
        // الخادم يضبط كوكي جلسة واحداً (shasha_session) — نأخذ الجزء الأول
        // قبل أول ';' فلا تؤثر فواصل تاريخ Expires
        for raw in raws {
            let pair = raw.split(separator: ";").first.map(String.init)?.trimmingCharacters(in: .whitespaces) ?? ""
            guard pair.contains("=") else { continue }
            let name = String(pair.split(separator: "=")[0]).trimmingCharacters(in: .whitespaces)
            let value = pair.split(separator: "=", maxSplits: 1).count > 1
                ? String(pair.split(separator: "=", maxSplits: 1)[1]).trimmingCharacters(in: .whitespaces)
                : ""
            let maxAge = raw.range(of: "Max-Age=(\\d+)", options: .regularExpression)
                .flatMap { Int(raw[$0].dropFirst("Max-Age=".count)) }
            if maxAge == 0 || value.isEmpty {
                map.removeValue(forKey: name)
            } else {
                map[name] = value
            }
        }
        storedCookies = map.map { "\($0.key)=\($0.value)" }.joined(separator: "; ")
    }

    // MARK: - النواة

    private func request<T: Decodable>(_ path: String, method: String = "GET", body: AnyEncodable? = nil) async throws -> T {
        guard let url = URL(string: Self.base + path) else { throw NetError.network }
        var req = URLRequest(url: url)
        req.httpMethod = method
        if !storedCookies.isEmpty {
            req.setValue(storedCookies, forHTTPHeaderField: "Cookie")
        }
        if let body {
            req.setValue("application/json", forHTTPHeaderField: "Content-Type")
            req.httpBody = try encoder.encode(body)
        }

        let (data, resp): (Data, URLResponse)
        do {
            (data, resp) = try await session.data(for: req)
        } catch {
            throw NetError.network
        }
        guard let http = resp as? HTTPURLResponse else { throw NetError.network }
        absorbSetCookies(http)

        if (200..<300).contains(http.statusCode) {
            do {
                return try decoder.decode(T.self, from: data)
            } catch {
                throw NetError.parse
            }
        }
        // خطأ من الخادم — نص parsed في المتن إن وجد
        if let errBody = try? decoder.decode(ApiErrorBody.self, from: data) {
            throw NetError.server(errBody.error ?? "HTTP \(http.statusCode)", errBody.code)
        }
        throw NetError.server("HTTP \(http.statusCode)", nil)
    }

    enum NetError: Error {
        case network
        case parse
        case server(String, String?)
    }

    private func net<T>(_ block: @escaping () async throws -> T) async -> Net<T> {
        do {
            return .ok(try await block())
        } catch let NetError.server(message, code) {
            return .err(message: message, code: code)
        } catch {
            return .err(message: "network", code: NET_CODE_NETWORK)
        }
    }

    // MARK: - نقاط النهاية (نفس عقد أندرويد)

    func titles(type: String? = nil, genre: String? = nil, q: String? = nil, section: String? = nil, sort: String? = nil, limit: Int = 24) async -> Net<TitlesResponse> {
        var params: [String] = []
        if let type { params.append("type=\(type)") }
        if let genre { params.append("genre=\(genre)") }
        if let q, !q.isEmpty { params.append("q=" + percentEncode(q)) }
        if let section { params.append("section=\(section)") }
        if let sort { params.append("sort=\(sort)") }
        params.append("limit=\(limit)")
        let path = "/api/titles?" + params.joined(separator: "&")
        return await net { try await request(path) }
    }

    func detail(slug: String) async -> Net<TitleResponse> {
        await net { try await request("/api/titles/" + percentEncode(slug)) }
    }

    func play(slug: String, episodeId: String? = nil) async -> Net<PlayResponse> {
        var path = "/api/titles/" + percentEncode(slug) + "/play"
        if let e = episodeId, !e.isEmpty { path += "?e=" + percentEncode(e) }
        return await net { try await request(path) }
    }

    func genres() async -> Net<GenresResponse> {
        await net { try await request("/api/genres") }
    }

    func plans() async -> Net<PlansResponse> {
        await net { try await request("/api/plans") }
    }

    func me() async -> Net<MeResponse> {
        await net { try await request("/api/auth/me") }
    }

    func login(email: String, password: String) async -> Net<UserResponse> {
        await net { try await request("/api/auth/login", method: "POST", body: LoginRequest(email: email, password: password)) }
    }

    func register(email: String, name: String, password: String) async -> Net<UserResponse> {
        await net { try await request("/api/auth/register", method: "POST", body: RegisterRequest(email: email, name: name, password: password)) }
    }

    func logout() async -> Net<UserResponse> {
        await net { try await request("/api/auth/logout", method: "POST") }
    }

    func watchlist() async -> Net<TitlesResponse> {
        await net { try await request("/api/watchlist") }
    }

    func addWatchlist(slug: String) async -> Net<WatchResponse> {
        await net { try await request("/api/watchlist", method: "POST", body: SlugRequest(slug: slug)) }
    }

    func removeWatchlist(slug: String) async -> Net<WatchResponse> {
        await net { try await request("/api/watchlist?slug=" + percentEncode(slug), method: "DELETE") }
    }

    func progressList() async -> Net<ProgressResponse> {
        await net { try await request("/api/progress") }
    }

    func saveProgress(slug: String, episodeId: String?, positionSec: Double, durationSec: Double) async -> Net<ProgressResponse> {
        await net {
            try await request("/api/progress", method: "POST",
                              body: ProgressRequest(slug: slug, episodeId: episodeId, positionSec: positionSec, durationSec: durationSec))
        }
    }

    func subscribe(planCode: String) async -> Net<SubscribeResponse> {
        await net { try await request("/api/subscribe", method: "POST", body: PlanRequest(planCode: planCode)) }
    }

    func cancelSubscribe() async -> Net<SubscribeResponse> {
        await net { try await request("/api/subscribe", method: "DELETE") }
    }

    // MARK: - المساعدات

    private func percentEncode(_ s: String) -> String {
        s.addingPercentEncoding(withAllowedCharacters: .urlQueryAllowed) ?? s
    }

    /// رابط مطلق لصورة من الخادم
    static func imageUrl(_ path: String?) -> URL? {
        guard let path, !path.isEmpty else { return nil }
        if path.hasPrefix("http") { return URL(string: path) }
        return URL(string: base + path)
    }
}

// MARK: - مغلف عام للتشفير (لتجاوز الأنواع العامة في الباراميتر)

struct AnyEncodable: Encodable {
    private let encodeFunc: (Encoder) throws -> Void

    init(_ wrapped: some Encodable) {
        encodeFunc = { try wrapped.encode(to: $0) }
    }

    func encode(to encoder: Encoder) throws {
        try encodeFunc(encoder)
    }
}
