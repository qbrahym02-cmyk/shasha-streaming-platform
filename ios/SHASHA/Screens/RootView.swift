import SwiftUI

// ============================================================
// جذر التطبيق — تبويبات (رئيسية/بحث/VIP/حسابي) + تنقل داخلي
// ============================================================

enum Route: Hashable {
    case details(slug: String)
    case watch(slug: String, episodeId: String?)
    case browse(type: String?, genre: String?)
    case auth(mode: String)
    case list
    case plans
}

enum MainTab: Hashable {
    case home, search, vip, profile
}

struct RootView: View {
    @EnvironmentObject var session: SessionStore
    @State private var tab: MainTab = .home
    @State private var homeRouter = Router()
    @State private var searchRouter = Router()
    @State private var vipRouter = Router()
    @State private var profileRouter = Router()

    var body: some View {
        TabView(selection: $tab) {
            NavigationStack(path: $homeRouter.path) {
                HomeScreen()
                    .navigationDestination(for: Route.self) { destination($0) }
            }
            .environmentObject(homeRouter)
            .tabItem { Label(tr("tab_home"), systemImage: "house.fill") }
            .tag(MainTab.home)

            NavigationStack(path: $searchRouter.path) {
                SearchScreen()
                    .navigationDestination(for: Route.self) { destination($0) }
            }
            .environmentObject(searchRouter)
            .tabItem { Label(tr("tab_search"), systemImage: "magnifyingglass") }
            .tag(MainTab.search)

            NavigationStack(path: $vipRouter.path) {
                VipScreen()
                    .navigationDestination(for: Route.self) { destination($0) }
            }
            .environmentObject(vipRouter)
            .tabItem { Label(tr("tab_vip"), systemImage: "crown.fill") }
            .tag(MainTab.vip)

            NavigationStack(path: $profileRouter.path) {
                ProfileScreen()
                    .navigationDestination(for: Route.self) { destination($0) }
            }
            .environmentObject(profileRouter)
            .tabItem { Label(tr("tab_profile"), systemImage: "person.fill") }
            .tag(MainTab.profile)
        }
        .task {
            await session.bootstrap()
        }
        .shashaRTL()
    }

    @ViewBuilder
    private func destination(_ route: Route) -> some View {
        switch route {
        case .details(let slug):
            DetailsScreen(slug: slug)
        case .watch(let slug, let episodeId):
            PlayerScreen(slug: slug, episodeId: episodeId)
        case .browse(let type, let genre):
            BrowseScreen(type: type, genre: genre)
        case .auth(let mode):
            AuthScreen(mode: mode)
        case .list:
            WatchlistScreen()
        case .plans:
            VipScreen()
        }
    }
}
