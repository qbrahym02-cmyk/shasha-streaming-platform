import SwiftUI

// ============================================================
// موجّه التنقل — لكل تبويب ستاك مستقل
// ============================================================

@MainActor
final class Router: ObservableObject {
    @Published var path = NavigationPath()

    func go(_ route: Route) {
        path.append(route)
    }

    func pop() {
        if !path.isEmpty { path.removeLast() }
    }

    func popToRoot() {
        path = NavigationPath()
    }
}
