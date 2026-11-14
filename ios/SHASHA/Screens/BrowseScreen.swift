import SwiftUI

// ============================================================
// التصفح — شبكة كاملة مع مرشحات النوع والتصنيف والترتيب
// ============================================================

struct BrowseScreen: View {
    let type: String?
    let genre: String?

    @EnvironmentObject var router: Router
    @State private var genres: [Genre] = []
    @State private var selectedType: String?
    @State private var selectedGenre: String?
    @State private var sort: String = "popular"
    @State private var items: [Title] = []
    @State private var state: LoadState = .loading
    @State private var limit: Int = 30

    enum LoadState {
        case loading, ready, error(String)
    }

    var body: some View {
        ZStack {
            Color.bg.ignoresSafeArea()
            VStack(spacing: 12) {
                typeChips
                genreChips
                sortBar
                switch state {
                case .loading:
                    LoadingState()
                case .error(let message):
                    ErrorState(message: message) { Task { await load(reset: true) } }
                case .ready:
                    if items.isEmpty {
                        VStack {
                            Spacer()
                            ShashaText(tr("no_results"), size: 14, color: .textSecondary)
                            Spacer()
                        }
                    } else {
                        grid
                    }
                }
            }
        }
        .navigationTitle(titleText)
        .toolbarBackground(Color.bg, for: .navigationBar)
        .task {
            selectedType = type
            selectedGenre = genre
            if genres.isEmpty, case .ok(let r) = await APIClient.shared.genres() {
                genres = r.data
            }
            await load(reset: true)
        }
    }

    private var titleText: String {
        if let g = selectedGenre,
           let genre = genres.first(where: { $0.slug == g }) {
            return SessionStore.shared.isArabic ? genre.nameAr : genre.nameEn
        }
        if selectedType == "MOVIE" { return tr("movies") }
        if selectedType == "SERIES" { return tr("series") }
        return tr("browse")
    }

    // MARK: - المرشحات

    private var typeChips: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: 8) {
                GenreChip(text: tr("all"), selected: selectedType == nil) {
                    selectedType = nil
                    Task { await load(reset: true) }
                }
                GenreChip(text: tr("movies"), selected: selectedType == "MOVIE") {
                    selectedType = "MOVIE"
                    Task { await load(reset: true) }
                }
                GenreChip(text: tr("series"), selected: selectedType == "SERIES") {
                    selectedType = "SERIES"
                    Task { await load(reset: true) }
                }
            }
            .padding(.horizontal, 16)
        }
    }

    private var genreChips: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: 8) {
                GenreChip(text: tr("all"), selected: selectedGenre == nil) {
                    selectedGenre = nil
                    Task { await load(reset: true) }
                }
                ForEach(genres) { genre in
                    GenreChip(
                        text: SessionStore.shared.isArabic ? genre.nameAr : genre.nameEn,
                        selected: selectedGenre == genre.slug
                    ) {
                        selectedGenre = genre.slug
                        Task { await load(reset: true) }
                    }
                }
            }
            .padding(.horizontal, 16)
        }
    }

    private var sortBar: some View {
        HStack(spacing: 0) {
            sortButton("popular", label: tr("sort_popular"))
            sortButton("newest", label: tr("sort_newest"))
            Spacer()
        }
        .padding(.horizontal, 16)
    }

    private func sortButton(_ key: String, label: String) -> some View {
        Button {
            sort = key
            Task { await load(reset: true) }
        } label: {
            ShashaText(label, size: 13, weight: sort == key ? .bold : .medium,
                       color: sort == key ? .emerald : .textTertiary)
                .padding(.trailing, 18)
        }
        .buttonStyle(.plain)
    }

    // MARK: - الشبكة

    private var grid: some View {
        ScrollView(showsIndicators: false) {
            LazyVGrid(columns: [GridItem(.adaptive(minimum: 108), spacing: 10)], spacing: 14) {
                ForEach(items) { item in
                    PosterCard(title: item, width: 108) {
                        router.go(.details(slug: item.slug))
                    }
                }
            }
            .padding(.horizontal, 16)
            .padding(.bottom, 24)

            if items.count >= limit {
                Button {
                    limit += 30
                    Task { await load(reset: false) }
                } label: {
                    ShashaText(tr("loading"), size: 13, color: .textSecondary)
                        .padding(.bottom, 20)
                }
                .buttonStyle(.plain)
            }
        }
        .refreshable { await load(reset: true) }
    }

    // MARK: - منطق

    private func load(reset: Bool) async {
        if reset {
            limit = 30
            state = .loading
        }
        let result = await APIClient.shared.titles(
            type: selectedType,
            genre: selectedGenre,
            sort: sort == "popular" ? "popular" : "newest",
            limit: limit
        )
        switch result {
        case .ok(let r):
            items = r.data
            state = .ready
        case .err(let message, let code):
            state = .error(code == NET_CODE_NETWORK ? tr("error_network") : message)
        }
    }
}
