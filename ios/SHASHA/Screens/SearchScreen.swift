import SwiftUI

// ============================================================
// البحث — بحث فوري مع اقتراحات التصنيفات
// ============================================================

struct SearchScreen: View {
    @EnvironmentObject var router: Router
    @State private var query: String = ""
    @State private var results: [Title] = []
    @State private var genres: [Genre] = []
    @State private var searching: Bool = false
    @State private var searched: Bool = false
    @State private var searchTask: Task<Void, Never>?

    var body: some View {
        ZStack {
            Color.bg.ignoresSafeArea()
            VStack(spacing: 14) {
                searchField
                if query.isEmpty {
                    genreChips
                }
                if !query.isEmpty && results.isEmpty && !searching && searched {
                    emptyState
                } else if query.isEmpty {
                    Spacer()
                    hintState
                    Spacer()
                } else {
                    resultsGrid
                }
            }
        }
        .navigationTitle(tr("tab_search"))
        .toolbarBackground(Color.bg, for: .navigationBar)
        .task {
            if genres.isEmpty {
                if case .ok(let r) = await APIClient.shared.genres() {
                    genres = r.data
                }
            }
        }
    }

    private var searchField: some View {
        HStack(spacing: 10) {
            Image(systemName: "magnifyingglass")
                .foregroundColor(.textTertiary)
            TextField(tr("search_hint"), text: $query)
                .font(Font(ShashaFont.ui(15)))
                .foregroundColor(.textPrimary)
                .autocorrectionDisabled()
                .submitLabel(.search)
                .onChange(of: query) { newValue in
                    scheduleSearch(newValue)
                }
            if !query.isEmpty {
                Button {
                    query = ""
                    results = []
                    searched = false
                } label: {
                    Image(systemName: "xmark.circle.fill")
                        .foregroundColor(.textTertiary)
                }
                .buttonStyle(.plain)
            }
        }
        .padding(.horizontal, 14)
        .padding(.vertical, 12)
        .background(RoundedRectangle(cornerRadius: 12).fill(Color.surfaceCard))
        .overlay(RoundedRectangle(cornerRadius: 12).stroke(Color.outline, lineWidth: 1))
        .padding(.horizontal, 16)
        .padding(.top, 8)
    }

    private var genreChips: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: 8) {
                ForEach(genres) { genre in
                    GenreChip(text: SessionStore.shared.isArabic ? genre.nameAr : genre.nameEn) {
                        router.go(.browse(type: nil, genre: genre.slug))
                    }
                }
            }
            .padding(.horizontal, 16)
        }
    }

    private var hintState: some View {
        VStack(spacing: 12) {
            Image(systemName: "magnifyingglass")
                .font(.system(size: 40))
                .foregroundColor(.textTertiary)
            ShashaText(tr("search_empty"), size: 14, color: .textSecondary)
        }
    }

    private var emptyState: some View {
        VStack(spacing: 12) {
            Image(systemName: "slash.circle")
                .font(.system(size: 36))
                .foregroundColor(.textTertiary)
            ShashaText(tr("no_results"), size: 14, color: .textSecondary)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
    }

    private var resultsGrid: some View {
        ScrollView(showsIndicators: false) {
            if searching {
                HStack {
                    Spacer()
                    ProgressView().tint(.emerald)
                    Spacer()
                }
                .padding(.top, 30)
            } else {
                LazyVGrid(columns: [GridItem(.adaptive(minimum: 108), spacing: 10)], spacing: 14) {
                    ForEach(results) { item in
                        PosterCard(title: item, width: 108) {
                            router.go(.details(slug: item.slug))
                        }
                    }
                }
                .padding(.horizontal, 16)
                .padding(.bottom, 24)
            }
        }
    }

    /// بحث مؤجل 400ms بعد آخر حرف
    private func scheduleSearch(_ text: String) {
        searchTask?.cancel()
        guard !text.trimmingCharacters(in: .whitespaces).isEmpty else {
            results = []
            searched = false
            searching = false
            return
        }
        searching = true
        searchTask = Task {
            try? await Task.sleep(nanoseconds: 400_000_000)
            guard !Task.isCancelled else { return }
            await runSearch(text)
        }
    }

    private func runSearch(_ text: String) async {
        let result = await APIClient.shared.titles(q: text, limit: 40)
        guard !Task.isCancelled else { return }
        if case .ok(let r) = result {
            results = r.data
        } else {
            results = []
        }
        searching = false
        searched = true
    }
}
