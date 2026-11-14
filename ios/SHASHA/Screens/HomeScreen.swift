import SwiftUI

// ============================================================
// الرئيسية — بطل مميز + تابع المشاهدة + رواج + أحدث + VIP
// ============================================================

struct HomeScreen: View {
    @EnvironmentObject var session: SessionStore
    @EnvironmentObject var router: Router
    @State private var state: LoadState = .loading
    @State private var hero: [Title] = []
    @State private var continueWatching: [Title] = []
    @State private var trending: [Title] = []
    @State private var newest: [Title] = []
    @State private var vipPicks: [Title] = []
    @State private var heroIndex: Int = 0

    enum LoadState {
        case loading, ready, error(String)
    }

    var body: some View {
        ZStack {
            Color.bg.ignoresSafeArea()
            switch state {
            case .loading:
                LoadingState(text: tr("loading"))
            case .error(let message):
                ErrorState(message: message) { load() }
            case .ready:
                content
            }
        }
        .navigationTitle("")
        .toolbar(.hidden, for: .navigationBar)
        .task { if case .loading = state { await load() } }
    }

    private var content: some View {
        ScrollView(showsIndicators: false) {
            VStack(alignment: .leading, spacing: 26) {
                header
                if !continueWatching.isEmpty {
                    PosterRow(heading: tr("continue_watching"), items: continueWatching) { go(.details(slug: $0.slug)) }
                }
                if !trending.isEmpty {
                    PosterRow(heading: tr("trending"), items: trending) { go(.details(slug: $0.slug)) }
                }
                if !vipPicks.isEmpty {
                    PosterRow(heading: tr("vip_section"), items: vipPicks) { go(.details(slug: $0.slug)) }
                }
                if !newest.isEmpty {
                    PosterRow(heading: tr("newest"), items: newest) { go(.details(slug: $0.slug)) }
                }
                genresStrip
                footer
            }
            .padding(.bottom, 24)
        }
        .refreshable { await load() }
    }

    // MARK: - الترويسة

    private var header: some View {
        VStack(spacing: 0) {
            HStack {
                ShashaLogo()
                Spacer()
                NavigationLink(value: Route.list) {
                    Image(systemName: "bookmark.fill")
                        .font(.system(size: 17))
                        .foregroundColor(.textSecondary)
                }
                .buttonStyle(.plain)
            }
            .padding(.horizontal, 16)
            .padding(.top, 8)

            // البطل الدوّار
            if !hero.isEmpty {
                VStack(spacing: 0) {
                    TabView(selection: $heroIndex) {
                        ForEach(Array(hero.enumerated()), id: \.element.id) { index, item in
                            HeroCard(title: item) {
                                go(.details(slug: item.slug))
                            }
                            .tag(index)
                        }
                    }
                    .tabViewStyle(.page(indexDisplayMode: .never))
                    .frame(height: 470)
                    .task(id: hero.count) {
                        // تدوير تلقائي كل 6 ثوانٍ — يتوقف مع مغادرة الشاشة
                        while !Task.isCancelled && !hero.isEmpty {
                            try? await Task.sleep(nanoseconds: 6_000_000_000)
                            guard !Task.isCancelled else { return }
                            withAnimation(.easeInOut(duration: 0.6)) {
                                heroIndex = (heroIndex + 1) % hero.count
                            }
                        }
                    }

                    HStack(spacing: 6) {
                        ForEach(0..<hero.count, id: \.self) { i in
                            Capsule()
                                .fill(i == heroIndex ? Color.emerald : Color.outline)
                                .frame(width: i == heroIndex ? 18 : 6, height: 6)
                        }
                    }
                    .padding(.top, -18)
                }
            }
        }
    }

    // MARK: - شريط التصنيفات

    private var genresStrip: some View {
        VStack(alignment: .leading, spacing: 10) {
            ShashaText(tr("browse"), size: 18, weight: .bold)
                .padding(.horizontal, 16)
            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: 10) {
                    NavigationLink(value: Route.browse(type: "MOVIE", genre: nil)) {
                        CategoryPill(icon: "film.fill", label: tr("movies"))
                    }
                    .buttonStyle(.plain)
                    NavigationLink(value: Route.browse(type: "SERIES", genre: nil)) {
                        CategoryPill(icon: "tv.fill", label: tr("series"))
                    }
                    .buttonStyle(.plain)
                }
                .padding(.horizontal, 16)
            }
        }
    }

    private var footer: some View {
        VStack(spacing: 6) {
            ShashaText(SessionStore.shared.isArabic ? "منصة بث جزائرية — كل المحتوى مفتوح أو تجريبي" : "Algerian streaming platform — all content is open or demo", size: 11, color: .textTertiary)
            ShashaText("© 2026 SHASHA", size: 10, color: .textTertiary)
        }
        .frame(maxWidth: .infinity)
        .padding(.top, 8)
    }

    // MARK: - منطق

    private func go(_ route: Route) {
        router.go(route)
    }

    private func load() async {
        state = .loading
        async let h = APIClient.shared.titles(section: "hero", limit: 5)
        async let t = APIClient.shared.titles(section: "trending", limit: 12)
        async let n = APIClient.shared.titles(section: "newest", limit: 12)
        async let v = APIClient.shared.titles(section: "vip", limit: 12)
        async let c = APIClient.shared.progressList()

        let heroR = await h
        let trendR = await t
        let newR = await n
        let vipR = await v
        let contR = await c

        switch heroR {
        case .ok(let resp):
            hero = resp.data
        case .err(let message, let code):
            state = .error(code == NET_CODE_NETWORK ? tr("error_network") : message)
            return
        }
        if case .ok(let r) = trendR { trending = r.data }
        if case .ok(let r) = newR { newest = r.data }
        if case .ok(let r) = vipR { vipPicks = r.data }
        if case .ok(let r) = contR {
            continueWatching = r.data.list.filter { $0.progressPct > 0 && $0.progressPct < 97 }
        }
        state = .ready
    }
}

// MARK: - بطاقة البطل

struct HeroCard: View {
    let title: Title
    let onTap: () -> Void

    var body: some View {
        ZStack(alignment: .bottomLeading) {
            RemoteImage(url: APIClient.imageUrl(title.backdrop ?? title.poster))
                .frame(height: 470)
                .clipped()

            LinearGradient(
                colors: [.clear, .bg.opacity(0.35), .bg],
                startPoint: .top, endPoint: .bottom
            )
            .frame(height: 260)
            .frame(maxHeight: .infinity, alignment: .bottom)

            VStack(alignment: .leading, spacing: 10) {
                HStack(spacing: 6) {
                    if title.isPremium { VipBadge() }
                    ShashaText(title.genres.map { SessionStore.shared.isArabic ? $0.nameAr : $0.nameEn }.prefix(2).joined(separator: " • "), size: 11, color: .textSecondary)
                }
                ShashaText(title.name(SessionStore.shared.isArabic), size: 30, weight: .bold)
                    .lineLimit(2)
                    .shadow(radius: 6)

                HStack(spacing: 10) {
                    if let score = title.score {
                        Label(String(format: "%.1f", score), systemImage: "star.fill")
                            .font(.custom("Tajawal-Medium", size: 12))
                            .foregroundColor(.gold)
                    }
                    if let year = title.year {
                        ShashaText(String(year), size: 12, color: .textSecondary)
                    }
                    if let age = title.ageRating {
                        ShashaText(age, size: 12, color: .textSecondary)
                    }
                    if let dur = title.durationMin {
                        ShashaText("\(dur) \(tr("minutes"))", size: 12, color: .textSecondary)
                    }
                }

                ShashaText(title.synopsis(SessionStore.shared.isArabic), size: 12, color: .textSecondary)
                    .lineLimit(2)
                    .padding(.trailing, 40)

                HStack(spacing: 10) {
                    Button(action: onTap) {
                        HStack(spacing: 7) {
                            Image(systemName: "play.fill")
                            ShashaText(title.isReleased ? tr("watch_now") : tr("details"), size: 14, weight: .bold, color: .black)
                        }
                        .padding(.horizontal, 22)
                        .padding(.vertical, 11)
                        .background(Capsule().fill(Color.emerald))
                    }
                    .buttonStyle(.plain)

                    Button(action: onTap) {
                        HStack(spacing: 7) {
                            Image(systemName: "info.circle")
                            ShashaText(tr("details"), size: 14, weight: .bold, color: .textPrimary)
                        }
                        .padding(.horizontal, 18)
                        .padding(.vertical, 11)
                        .background(Capsule().stroke(Color.outline, lineWidth: 1))
                    }
                    .buttonStyle(.plain)
                }
                .padding(.top, 2)
            }
            .padding(16)
            .padding(.bottom, 34)
        }
        .onTapGesture(perform: onTap)
    }
}

// MARK: - حبة تصنيف كبيرة

struct CategoryPill: View {
    let icon: String
    let label: String

    var body: some View {
        HStack(spacing: 8) {
            Image(systemName: icon)
                .foregroundColor(.emerald)
            ShashaText(label, size: 14, weight: .bold)
        }
        .padding(.horizontal, 20)
        .padding(.vertical, 12)
        .background(RoundedRectangle(cornerRadius: 14).fill(Color.surfaceCard))
        .overlay(RoundedRectangle(cornerRadius: 14).stroke(Color.outline, lineWidth: 1))
    }
}
