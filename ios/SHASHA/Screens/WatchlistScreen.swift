import SwiftUI

// ============================================================
// قائمتي — المحفوظات
// ============================================================

struct WatchlistScreen: View {
    @EnvironmentObject var router: Router
    @State private var items: [Title] = []
    @State private var state: LoadState = .loading

    enum LoadState {
        case loading, ready, error(String), unauthenticated
    }

    var body: some View {
        ZStack {
            Color.bg.ignoresSafeArea()
            switch state {
            case .loading:
                LoadingState(text: tr("loading"))
            case .unauthenticated:
                VStack(spacing: 14) {
                    Image(systemName: "person.crop.circle")
                        .font(.system(size: 40))
                        .foregroundColor(.textTertiary)
                    ShashaText(tr("login_to_continue"), size: 14, color: .textSecondary)
                    Button {
                        router.go(.auth(mode: "login"))
                    } label: {
                        ShashaText(tr("login"), size: 14, weight: .bold, color: .black)
                            .padding(.horizontal, 28)
                            .padding(.vertical, 11)
                            .background(Capsule().fill(Color.emerald))
                    }
                    .buttonStyle(.plain)
                }
            case .error(let message):
                ErrorState(message: message) { Task { await load() } }
            case .ready:
                if items.isEmpty {
                    VStack(spacing: 12) {
                        Spacer()
                        Image(systemName: "bookmark")
                            .font(.system(size: 36))
                            .foregroundColor(.textTertiary)
                        ShashaText(tr("my_list"), size: 15, color: .textSecondary)
                        Spacer()
                    }
                } else {
                    ScrollView(showsIndicators: false) {
                        LazyVGrid(columns: [GridItem(.adaptive(minimum: 106), spacing: 10)], spacing: 14) {
                            ForEach(items) { item in
                                PosterCard(title: item, width: 106) {
                                    router.go(.details(slug: item.slug))
                                }
                            }
                        }
                        .padding(16)
                    }
                    .refreshable { await load() }
                }
            }
        }
        .navigationTitle(tr("my_list"))
        .toolbarBackground(Color.bg, for: .navigationBar)
        .task { await load() }
    }

    private func load() async {
        guard SessionStore.shared.isLoggedIn else {
            state = .unauthenticated
            return
        }
        state = .loading
        let result = await APIClient.shared.watchlist()
        switch result {
        case .ok(let r):
            items = r.data
            state = .ready
        case .err(let message, let code):
            if code == "auth_required" {
                state = .unauthenticated
            } else {
                state = .error(code == NET_CODE_NETWORK ? tr("error_network") : message)
            }
        }
    }
}
