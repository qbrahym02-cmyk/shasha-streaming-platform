import SwiftUI

// ============================================================
// حسابي — الملف الشخصي والإعدادات واللغة
// ============================================================

struct ProfileScreen: View {
    @EnvironmentObject var router: Router
    @EnvironmentObject var session: SessionStore
    @State private var showLogoutConfirm: Bool = false
    @State private var continueItems: [Title] = []
    @State private var loadedProgress: Bool = false

    var body: some View {
        ZStack {
            Color.bg.ignoresSafeArea()
            ScrollView(showsIndicators: false) {
                VStack(spacing: 22) {
                    header

                    if session.isLoggedIn {
                        accountCard
                        vipCard
                        if !continueItems.isEmpty {
                            PosterRow(heading: tr("continue_watching"), items: continueItems) { item in
                                router.go(.details(slug: item.slug))
                            }
                        }
                        settingsCard
                        logoutCard
                    } else {
                        guestCard
                        settingsCard
                    }

                    aboutSection
                }
                .padding(.bottom, 30)
            }
        }
        .navigationTitle(tr("tab_profile"))
        .toolbarBackground(Color.bg, for: .navigationBar)
        .task {
            if session.isLoggedIn && !loadedProgress {
                loadedProgress = true
                if case .ok(let r) = await APIClient.shared.progressList() {
                    continueItems = r.data.list.filter { $0.progressPct > 0 && $0.progressPct < 97 }
                }
            }
        }
        .confirmationDialog(tr("logout_confirm"), isPresented: $showLogoutConfirm, titleVisibility: .visible) {
            Button(tr("logout"), role: .destructive) {
                Task {
                    await session.logout()
                }
            }
            Button(tr("cancel"), role: .cancel) {}
        }
    }

    private var header: some View {
        VStack(spacing: 8) {
            if let user = session.user {
                AvatarView(name: user.name, colorHex: user.avatarColor, size: 72)
                ShashaText(user.name, size: 20, weight: .bold)
                ShashaText(user.email, size: 12, color: .textTertiary)
                if user.isVip {
                    HStack(spacing: 6) {
                        VipBadge()
                        if let until = user.vipUntil {
                            ShashaText(trFmt("vip_active_until", [String(until.prefix(10))]), size: 11, color: .textSecondary)
                        }
                    }
                }
            } else {
                Image(systemName: "person.crop.circle")
                    .font(.system(size: 64))
                    .foregroundColor(.textTertiary)
                ShashaText(tr("guest"), size: 20, weight: .bold)
            }
            ShashaText(tr("desc_profile"), size: 12, color: .textSecondary)
        }
        .frame(maxWidth: .infinity)
        .padding(.top, 18)
    }

    private var accountCard: some View {
        VStack(spacing: 0) {
            NavigationLink(value: Route.list) {
                settingsRow(icon: "bookmark.fill", tint: .emerald, label: tr("my_list"))
            }
            .buttonStyle(.plain)
            Divider().overlay(Color.outline)
            Button {
                router.go(.browse(type: nil, genre: nil))
            } label: {
                settingsRow(icon: "square.grid.2x2.fill", tint: .emerald, label: tr("browse"))
            }
            .buttonStyle(.plain)
        }
        .background(RoundedRectangle(cornerRadius: 16).fill(Color.surfaceCard))
    }

    private var vipCard: some View {
        NavigationLink(value: Route.plans) {
            HStack(spacing: 12) {
                Image(systemName: "crown.fill")
                    .font(.system(size: 20))
                    .foregroundColor(session.isVip ? .gold : .textTertiary)
                VStack(alignment: .leading, spacing: 3) {
                    ShashaText(session.isVip ? tr("vip_active") : tr("vip_title"), size: 15, weight: .bold,
                               color: session.isVip ? .emerald : .textPrimary)
                    ShashaText(tr("vip_subtitle"), size: 11, color: .textSecondary)
                        .lineLimit(1)
                }
                Spacer()
                Image(systemName: session.isArabic ? "chevron.left" : "chevron.right")
                    .font(.system(size: 12))
                    .foregroundColor(.textTertiary)
            }
            .padding(16)
            .background(RoundedRectangle(cornerRadius: 16).fill(Color.gold.opacity(0.06)))
            .overlay(RoundedRectangle(cornerRadius: 16).stroke(Color.gold.opacity(0.3), lineWidth: 1))
        }
        .buttonStyle(.plain)
    }

    private var settingsCard: some View {
        VStack(spacing: 0) {
            VStack(alignment: .leading, spacing: 12) {
                ShashaText(tr("language"), size: 13, weight: .bold, color: .textSecondary)
                HStack(spacing: 10) {
                    langButton(arabic: true)
                    langButton(arabic: false)
                }
            }
            .padding(16)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(RoundedRectangle(cornerRadius: 16).fill(Color.surfaceCard))
    }

    private func langButton(arabic: Bool) -> some View {
        Button {
            session.setLanguage(arabic)
        } label: {
            ShashaText(arabic ? tr("arabic") : tr("english"), size: 13, weight: .bold,
                       color: session.isArabic == arabic ? .black : .textSecondary)
                .frame(maxWidth: .infinity)
                .padding(.vertical, 10)
                .background(Capsule().fill(session.isArabic == arabic ? Color.emerald : Color.surfaceHigh))
        }
        .buttonStyle(.plain)
    }

    private var logoutCard: some View {
        Button {
            showLogoutConfirm = true
        } label: {
            HStack(spacing: 10) {
                Image(systemName: "rectangle.portrait.and.arrow.right")
                    .font(.system(size: 15))
                ShashaText(tr("logout"), size: 14, weight: .bold)
            }
            .foregroundColor(.danger)
            .frame(maxWidth: .infinity)
            .padding(.vertical, 14)
            .background(RoundedRectangle(cornerRadius: 16).fill(Color.danger.opacity(0.08)))
        }
        .buttonStyle(.plain)
    }

    private var guestCard: some View {
        VStack(spacing: 12) {
            ShashaText(tr("login_to_continue"), size: 14, color: .textSecondary)
            HStack(spacing: 10) {
                Button {
                    router.go(.auth(mode: "login"))
                } label: {
                    ShashaText(tr("login"), size: 14, weight: .bold, color: .black)
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 12)
                        .background(Capsule().fill(Color.emerald))
                }
                .buttonStyle(.plain)

                Button {
                    router.go(.auth(mode: "register"))
                } label: {
                    ShashaText(tr("register"), size: 14, weight: .bold, color: .textPrimary)
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 12)
                        .background(Capsule().stroke(Color.outline, lineWidth: 1))
                }
                .buttonStyle(.plain)
            }
        }
        .padding(16)
        .background(RoundedRectangle(cornerRadius: 16).fill(Color.surfaceCard))
    }

    private var aboutSection: some View {
        VStack(spacing: 4) {
            ShashaLogo(size: 22)
            ShashaText("\(tr("version")) 2.0.0 (iOS)", size: 11, color: .textTertiary)
            ShashaText("© 2026 SHASHA — Algiers", size: 10, color: .textTertiary)
        }
        .frame(maxWidth: .infinity)
        .padding(.top, 8)
    }

    private func settingsRow(icon: String, tint: Color, label: String) -> some View {
        HStack(spacing: 12) {
            Image(systemName: icon)
                .font(.system(size: 15))
                .foregroundColor(tint)
                .frame(width: 24)
            ShashaText(label, size: 14, weight: .medium)
            Spacer()
            Image(systemName: session.isArabic ? "chevron.left" : "chevron.right")
                .font(.system(size: 12))
                .foregroundColor(.textTertiary)
        }
        .padding(16)
    }
}
