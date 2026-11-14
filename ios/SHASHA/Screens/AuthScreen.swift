import SwiftUI

// ============================================================
// الدخول/التسجيل — مع الحسابات التجريبية الجاهزة
// ============================================================

struct AuthScreen: View {
    let mode: String

    @EnvironmentObject var router: Router
    @EnvironmentObject var session: SessionStore
    @Environment(\.dismiss) private var dismiss

    @State private var isRegister: Bool = false
    @State private var email: String = ""
    @State private var name: String = ""
    @State private var password: String = ""
    @State private var busy: Bool = false
    @State private var errorMsg: String?
    @State private var showPassword: Bool = false

    var body: some View {
        ZStack {
            Color.bg.ignoresSafeArea()
            ScrollView(showsIndicators: false) {
                VStack(spacing: 22) {
                    logoSection
                    formCard
                    demoAccounts
                }
                .padding(.horizontal, 20)
                .padding(.bottom, 30)
            }
        }
        .navigationTitle(isRegister ? tr("register") : tr("login"))
        .toolbarBackground(Color.bg, for: .navigationBar)
        .onAppear {
            isRegister = mode == "register"
        }
    }

    private var logoSection: some View {
        VStack(spacing: 12) {
            ShashaLogo(size: 44)
                .padding(.top, 26)
            ShashaText(isRegister ? tr("register") : tr("login_to_continue"), size: 14, color: .textSecondary)
        }
    }

    private var formCard: some View {
        VStack(spacing: 14) {
            if isRegister {
                field(icon: "person", placeholder: tr("full_name"), text: $name)
                    .autocorrectionDisabled()
            }
            field(icon: "envelope", placeholder: tr("email"), text: $email)
                .keyboardType(.emailAddress)
                .textContentType(.emailAddress)
                .autocorrectionDisabled()
                .textInputAutocapitalization(.never)

            HStack(spacing: 10) {
                Image(systemName: "lock")
                    .foregroundColor(.textTertiary)
                    .frame(width: 20)
                if showPassword {
                    TextField(tr("password"), text: $password)
                        .font(Font(ShashaFont.ui(15)))
                        .foregroundColor(.textPrimary)
                } else {
                    SecureField(tr("password"), text: $password)
                        .font(Font(ShashaFont.ui(15)))
                        .foregroundColor(.textPrimary)
                        .textContentType(isRegister ? .newPassword : .password)
                }
                Button {
                    showPassword.toggle()
                } label: {
                    Image(systemName: showPassword ? "eye.slash" : "eye")
                        .foregroundColor(.textTertiary)
                }
                .buttonStyle(.plain)
                Button {
                    Task { await submit() }
                } label: {
                    Image(systemName: "arrow.forward.circle.fill")
                        .font(.system(size: 26))
                        .foregroundColor(valid ? .emerald : .textTertiary)
                }
                .buttonStyle(.plain)
                .padding(.leading, 6)
            }
            .padding(.horizontal, 14)
            .padding(.vertical, 13)
            .background(RoundedRectangle(cornerRadius: 12).fill(Color.surfaceHigh))
            .overlay(RoundedRectangle(cornerRadius: 12).stroke(valid ? Color.clear : Color.danger.opacity(0.6), lineWidth: 1))
            .onSubmit { Task { await submit() } }

            if let error = errorMsg {
                ShashaText(error, size: 12, color: .danger)
                    .frame(maxWidth: .infinity, alignment: .leading)
            }

            PrimaryButton(label: isRegister ? tr("register") : tr("login"), loading: busy) {
                Task { await submit() }
            }

            Button {
                withAnimation { isRegister.toggle() }
                errorMsg = nil
            } label: {
                ShashaText(isRegister ? tr("have_account") : tr("no_account"), size: 13, weight: .medium, color: .emerald)
            }
            .buttonStyle(.plain)
        }
        .padding(18)
        .background(RoundedRectangle(cornerRadius: 18).fill(Color.surfaceCard))
        .overlay(RoundedRectangle(cornerRadius: 18).stroke(Color.outline, lineWidth: 1))
    }

    private func field(icon: String, placeholder: String, text: Binding<String>) -> some View {
        HStack(spacing: 10) {
            Image(systemName: icon)
                .foregroundColor(.textTertiary)
                .frame(width: 20)
            TextField(placeholder, text: text)
                .font(Font(ShashaFont.ui(15)))
                .foregroundColor(.textPrimary)
        }
        .padding(.horizontal, 14)
        .padding(.vertical, 13)
        .background(RoundedRectangle(cornerRadius: 12).fill(Color.surfaceHigh))
    }

    private var valid: Bool {
        if isRegister {
            return !name.isEmpty && !email.isEmpty && password.count >= 6
        }
        return !email.isEmpty && !password.isEmpty
    }

    private var demoAccounts: some View {
        VStack(spacing: 10) {
            ShashaText(tr("demo_accounts"), size: 12, weight: .bold, color: .textSecondary)
            HStack(spacing: 10) {
                demoButton(label: "VIP", email: "demo@shasha.app")
                demoButton(label: tr("free_content"), email: "free@shasha.app")
            }
        }
    }

    private func demoButton(label: String, email: String) -> some View {
        Button {
            self.email = email
            password = "demo1234"
            isRegister = false
            errorMsg = nil
        } label: {
            VStack(spacing: 3) {
                ShashaText(label, size: 12, weight: .bold, color: .emerald)
                ShashaText(email, size: 10, color: .textTertiary)
            }
            .frame(maxWidth: .infinity)
            .padding(.vertical, 10)
            .background(RoundedRectangle(cornerRadius: 12).fill(Color.surfaceHigh))
        }
        .buttonStyle(.plain)
    }

    // MARK: - منطق

    private func submit() async {
        guard valid, !busy else { return }
        busy = true
        errorMsg = nil
        defer { busy = false }

        let result: Net<User>
        if isRegister {
            result = await session.register(email: email, name: name, password: password)
        } else {
            result = await session.login(email: email, password: password)
        }

        switch result {
        case .ok:
            dismiss()
        case .err(let message, let code):
            errorMsg = code == NET_CODE_NETWORK ? tr("error_network") : message
        }
    }
}
