import SwiftUI

// ============================================================
// التفاصيل — خلفية + معلومات + حلقات + أعمال مشابهة + قائمتي
// ============================================================

struct DetailsScreen: View {
    let slug: String

    @EnvironmentObject var router: Router
    @EnvironmentObject var session: SessionStore
    @State private var title: Title?
    @State private var state: LoadState = .loading
    @State private var selectedSeason: Int = 1
    @State private var watchlistBusy: Bool = false

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
                ErrorState(message: message) { Task { await load() } }
            case .ready:
                if let t = title {
                    content(t)
                }
            }
        }
        .navigationTitle("")
        .toolbarBackground(.hidden, for: .navigationBar)
        .task { await load() }
    }

    private func content(_ t: Title) -> some View {
        ScrollView(showsIndicators: false) {
            VStack(alignment: .leading, spacing: 20) {
                header(t)
                metaRow(t)
                actions(t)
                if let synopsis = t.synopsis(session.isArabic), !synopsis.isEmpty {
                    section(tr("synopsis")) {
                        ShashaText(synopsis, size: 14, color: .textSecondary)
                            .lineSpacing(4)
                    }
                }
                if t.isSeries && !t.episodes.isEmpty {
                    episodesSection(t)
                }
                if !t.similar.isEmpty {
                    PosterRow(heading: tr("similar"), items: t.similar) { item in
                        router.go(.details(slug: item.slug))
                    }
                }
            }
            .padding(.bottom, 40)
        }
        .ignoresSafeArea(edges: .top)
    }

    // MARK: - الرأس

    private func header(_ t: Title) -> some View {
        ZStack(alignment: .bottomLeading) {
            RemoteImage(url: APIClient.imageUrl(t.backdrop ?? t.poster))
                .frame(height: 430)
                .clipped()

            LinearGradient(colors: [.clear, .bg.opacity(0.55), .bg], startPoint: .top, endPoint: .bottom)
                .frame(height: 230)
                .frame(maxHeight: .infinity, alignment: .bottom)

            VStack(alignment: .leading, spacing: 8) {
                HStack(spacing: 6) {
                    if t.isPremium { VipBadge() }
                    if !t.isReleased { SoonBadge() }
                }
                ShashaText(t.name(session.isArabic), size: 27, weight: .bold)
                HStack(spacing: 8) {
                    ForEach(t.genres.prefix(3)) { genre in
                        ShashaText(session.isArabic ? genre.nameAr : genre.nameEn, size: 11, color: .emerald)
                    }
                }
            }
            .padding(16)
            .padding(.bottom, 8)
        }
    }

    private func metaRow(_ t: Title) -> some View {
        HStack(spacing: 18) {
            if let score = t.score {
                meta(icon: "star.fill", tint: .gold, text: String(format: "%.1f", score))
            }
            if let year = t.year {
                meta(icon: "calendar", tint: .textSecondary, text: String(year))
            }
            if let dur = t.durationMin {
                meta(icon: "clock", tint: .textSecondary, text: "\(dur) \(tr("minutes"))")
            }
            if let age = t.ageRating {
                meta(icon: "person.2", tint: .textSecondary, text: age)
            }
            Spacer()
        }
        .padding(.horizontal, 16)
    }

    private func meta(icon: String, tint: Color, text: String) -> some View {
        HStack(spacing: 5) {
            Image(systemName: icon).font(.system(size: 11)).foregroundColor(tint)
            ShashaText(text, size: 12, color: .textSecondary)
        }
    }

    // MARK: - الأزرار

    private func actions(_ t: Title) -> some View {
        HStack(spacing: 10) {
            if t.isReleased {
                Button {
                    if !session.isLoggedIn {
                        router.go(.auth(mode: "login"))
                    } else if t.isPremium && !session.isVip {
                        router.go(.plans)
                    } else {
                        router.go(.watch(slug: t.slug, episodeId: t.progressEpisodeId))
                    }
                } label: {
                    HStack(spacing: 8) {
                        Image(systemName: "play.fill")
                        ShashaText(tr("watch_now"), size: 15, weight: .bold, color: .black)
                    }
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 13)
                    .background(Capsule().fill(Color.emerald))
                }
                .buttonStyle(.plain)
            } else {
                VStack(spacing: 6) {
                    ShashaText(tr("coming_soon_msg"), size: 13, color: .textSecondary)
                }
                .frame(maxWidth: .infinity)
            }

            Button {
                Task { await toggleWatchlist(t) }
            } label: {
                HStack(spacing: 8) {
                    if watchlistBusy {
                        ProgressView().tint(.emerald).scaleEffect(0.85)
                    } else {
                        Image(systemName: t.inWatchlist ? "checkmark" : "plus")
                            .font(.system(size: 14, weight: .bold))
                            .foregroundColor(.emerald)
                        ShashaText(t.inWatchlist ? tr("in_list") : tr("add_to_list"), size: 13, weight: .bold, color: .textPrimary)
                    }
                }
                .frame(maxWidth: .infinity)
                .padding(.vertical, 13)
                .background(Capsule().stroke(Color.outline, lineWidth: 1))
            }
            .buttonStyle(.plain)
            .disabled(watchlistBusy)
        }
        .padding(.horizontal, 16)
    }

    // MARK: - الحلقات

    private func episodesSection(_ t: Title) -> some View {
        section(tr("episodes")) {
            let seasons = Array(Set(t.episodes.map(\.season))).sorted()
            VStack(spacing: 12) {
                if seasons.count > 1 {
                    ScrollView(.horizontal, showsIndicators: false) {
                        HStack(spacing: 8) {
                            ForEach(seasons, id: \.self) { s in
                                GenreChip(text: trFmt("season", [s]), selected: selectedSeason == s) {
                                    selectedSeason = s
                                }
                            }
                        }
                    }
                }

                let eps = t.episodes.filter { $0.season == selectedSeason }

                ForEach(eps) { ep in
                    episodeRow(t, ep)
                }
            }
        }
    }

    private func episodeRow(_ t: Title, _ ep: Episode) -> some View {
        Button {
            if ep.isPremium && !session.isVip {
                router.go(.plans)
            } else if !session.isLoggedIn {
                router.go(.auth(mode: "login"))
            } else {
                router.go(.watch(slug: t.slug, episodeId: ep.id))
            }
        } label: {
            HStack(spacing: 12) {
                ZStack {
                    RoundedRectangle(cornerRadius: 8)
                        .fill(Color.surfaceHigh)
                        .frame(width: 92, height: 52)
                    Image(systemName: "play.circle.fill")
                        .font(.system(size: 22))
                        .foregroundColor(.emerald)
                }
                VStack(alignment: .leading, spacing: 4) {
                    ShashaText("\(ep.number). \(ep.name(session.isArabic))", size: 14, weight: .medium)
                        .lineLimit(1)
                    HStack(spacing: 8) {
                        if let dur = ep.durationMin {
                            ShashaText("\(dur) \(tr("minutes"))", size: 11, color: .textTertiary)
                        }
                        if ep.isPremium { VipBadge(compact: true) }
                    }
                }
                Spacer()
                Image(systemName: "chevron.forward")
                    .font(.system(size: 12))
                    .foregroundColor(.textTertiary)
            }
            .padding(10)
            .background(RoundedRectangle(cornerRadius: 12).fill(Color.surfaceCard))
        }
        .buttonStyle(.plain)
    }

    // MARK: - مساعدات

    private func section(_ heading: String, @ViewBuilder content: () -> some View) -> some View {
        VStack(alignment: .leading, spacing: 12) {
            ShashaText(heading, size: 18, weight: .bold)
                .padding(.horizontal, 16)
            content()
                .padding(.horizontal, 16)
        }
    }

    // MARK: - منطق

    private func load() async {
        state = .loading
        let result = await APIClient.shared.detail(slug: slug)
        switch result {
        case .ok(let r):
            if let t = r.data {
                title = t
                selectedSeason = t.episodes.first?.season ?? 1
                state = .ready
            } else {
                state = .error(r.error ?? tr("error_generic"))
            }
        case .err(let message, let code):
            state = .error(code == NET_CODE_NETWORK ? tr("error_network") : message)
        }
    }

    private func toggleWatchlist(_ t: Title) async {
        guard !watchlistBusy else { return }
        if !session.isLoggedIn {
            router.go(.auth(mode: "login"))
            return
        }
        watchlistBusy = true
        defer { watchlistBusy = false }
        let result = t.inWatchlist
            ? await APIClient.shared.removeWatchlist(slug: t.slug)
            : await APIClient.shared.addWatchlist(slug: t.slug)
        if case .ok(let r) = result, let body = r.data {
            if var updated = title {
                updated.inWatchlist = body.inWatchlist
                title = updated
            }
        }
    }
}
