import SwiftUI

// ============================================================
// VIP — الباقات والاشتراك التجريبي
// ============================================================

struct VipScreen: View {
    @EnvironmentObject var router: Router
    @EnvironmentObject var session: SessionStore
    @State private var plans: [Plan] = []
    @State private var state: LoadState = .loading
    @State private var subscribing: String?
    @State private var showSuccess: Bool = false
    @State private var errorMsg: String?

    enum LoadState {
        case loading, ready, error(String)
    }

    var body: some View {
        ZStack {
            Color.bg.ignoresSafeArea()
            ScrollView(showsIndicators: false) {
                VStack(spacing: 22) {
                    header

                    if session.isVip, let until = session.user?.vipUntil {
                        activeBanner(until)
                    }

                    switch state {
                    case .loading:
                        LoadingState()
                            .frame(height: 200)
                    case .error(let message):
                        ErrorState(message: message) { Task { await load() } }
                    case .ready:
                        plansGrid
                    }

                    ShashaText(tr("payment_demo_note"), size: 11, color: .textTertiary)
                        .padding(.bottom, 30)
                }
                .padding(.horizontal, 16)
            }
        }
        .navigationTitle(tr("tab_vip"))
        .toolbarBackground(Color.bg, for: .navigationBar)
        .task { await load() }
        .alert(tr("vip_success"), isPresented: $showSuccess) {
            Button("OK", role: .cancel) {}
        }
        .alert(errorMsg ?? "", isPresented: Binding(
            get: { errorMsg != nil },
            set: { if !$0 { errorMsg = nil } }
        )) {
            Button("OK", role: .cancel) {}
        }
    }

    private var header: some View {
        VStack(spacing: 10) {
            Image(systemName: "crown.fill")
                .font(.system(size: 40))
                .foregroundColor(.gold)
                .padding(.top, 24)
            ShashaText(tr("vip_title"), size: 22, weight: .bold)
            ShashaText(tr("vip_subtitle"), size: 13, color: .textSecondary)
                .multilineTextAlignment(.center)
        }
    }

    private func activeBanner(_ until: String) -> some View {
        VStack(spacing: 8) {
            HStack(spacing: 8) {
                Image(systemName: "checkmark.seal.fill")
                    .foregroundColor(.emerald)
                ShashaText(tr("vip_active"), size: 15, weight: .bold, color: .emerald)
            }
            ShashaText(trFmt("vip_active_until", [fmtDate(until)]), size: 12, color: .textSecondary)

            Button {
                Task { await cancelVip() }
            } label: {
                ShashaText(tr("vip_cancel"), size: 12, color: .danger)
                    .padding(.top, 4)
            }
            .buttonStyle(.plain)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 18)
        .background(RoundedRectangle(cornerRadius: 16).fill(Color.emerald.opacity(0.08)))
        .overlay(RoundedRectangle(cornerRadius: 16).stroke(Color.emerald.opacity(0.35), lineWidth: 1))
    }

    private var plansGrid: some View {
        VStack(spacing: 14) {
            ForEach(plans) { plan in
                planCard(plan)
            }
        }
    }

    private func planCard(_ plan: Plan) -> some View {
        let ar = session.isArabic
        return VStack(alignment: .leading, spacing: 12) {
            HStack {
                VStack(alignment: .leading, spacing: 4) {
                    HStack(spacing: 8) {
                        ShashaText(plan.name(ar), size: 17, weight: .bold)
                        if plan.highlight {
                            ShashaText(ar ? "الأوفر" : "Best value", size: 10, weight: .bold, color: .black)
                                .padding(.horizontal, 8)
                                .padding(.vertical, 3)
                                .background(Capsule().fill(Color.gold))
                        }
                    }
                    if let original = plan.originalDzd {
                        ShashaText(String(format: "%.0f %@", original, tr("dzd")), size: 11, color: .textTertiary)
                            .strikethrough()
                    }
                }
                Spacer()
                VStack(alignment: .trailing, spacing: 2) {
                    ShashaText(String(format: "%.0f %@", plan.priceDzd, tr("dzd")), size: 21, weight: .bold, color: plan.highlight ? .gold : .emerald)
                    ShashaText(plan.months >= 6 ? tr("per_six_months") : (ar ? "شهرياً" : "monthly"), size: 10, color: .textTertiary)
                }
            }

            VStack(alignment: .leading, spacing: 7) {
                ForEach(plan.features(ar), id: \.self) { feature in
                    HStack(spacing: 8) {
                        Image(systemName: "checkmark.circle.fill")
                            .font(.system(size: 12))
                            .foregroundColor(.emerald)
                        ShashaText(feature, size: 12, color: .textSecondary)
                    }
                }
            }

            if session.isVip {
                // فعّال — لا زر
            } else if session.isLoggedIn {
                Button {
                    Task { await subscribe(plan) }
                } label: {
                    HStack {
                        if subscribing == plan.code {
                            ProgressView().tint(.black).scaleEffect(0.9)
                        }
                        ShashaText(tr("activate"), size: 14, weight: .bold, color: .black)
                    }
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 12)
                    .background(Capsule().fill(plan.highlight ? Color.gold : Color.emerald))
                }
                .buttonStyle(.plain)
                .disabled(subscribing != nil)
            } else {
                Button {
                    router.go(.auth(mode: "login"))
                } label: {
                    ShashaText(tr("login_to_continue"), size: 14, weight: .bold, color: .black)
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 12)
                        .background(Capsule().fill(Color.emerald))
                }
                .buttonStyle(.plain)
            }
        }
        .padding(16)
        .background(
            RoundedRectangle(cornerRadius: 16)
                .fill(plan.highlight ? Color.gold.opacity(0.07) : Color.surfaceCard)
        )
        .overlay(
            RoundedRectangle(cornerRadius: 16)
                .stroke(plan.highlight ? Color.gold.opacity(0.45) : Color.outline, lineWidth: 1)
        )
    }

    // MARK: - منطق

    private func load() async {
        state = .loading
        let result = await APIClient.shared.plans()
        switch result {
        case .ok(let r):
            plans = r.data
            state = .ready
        case .err(let message, let code):
            state = .error(code == NET_CODE_NETWORK ? tr("error_network") : message)
        }
    }

    private func subscribe(_ plan: Plan) async {
        subscribing = plan.code
        defer { subscribing = nil }
        let result = await APIClient.shared.subscribe(planCode: plan.code)
        if case .ok(let r) = result, let user = r.data?.user {
            session.refreshAfterVip(user)
            showSuccess = true
        } else if case .err(let message, _) = result {
            errorMsg = message
        }
    }

    private func cancelVip() async {
        let result = await APIClient.shared.cancelSubscribe()
        if case .ok(let r) = result, let user = r.data?.user {
            session.refreshAfterVip(user)
        }
    }

    private func fmtDate(_ iso: String) -> String {
        let formatter = ISO8601DateFormatter()
        let display = DateFormatter()
        display.dateFormat = "dd/MM/yyyy"
        if let date = formatter.date(from: iso) {
            return display.string(from: date)
        }
        return String(iso.prefix(10))
    }
}
