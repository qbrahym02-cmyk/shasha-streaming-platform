import SwiftUI
import UIKit
import CoreText

// ============================================================
// هوية العلامة — ألوان وخطوط مطابقة لنسختي الويب وأندرويد
// ============================================================

extension Color {
    init(hex: UInt32) {
        self.init(
            .sRGB,
            red: Double((hex >> 16) & 0xFF) / 255.0,
            green: Double((hex >> 8) & 0xFF) / 255.0,
            blue: Double(hex & 0xFF) / 255.0,
            opacity: 1
        )
    }

    static let emerald = Color(hex: 0x00D26A)
    static let emeraldDark = Color(hex: 0x00A854)
    static let gold = Color(hex: 0xE8B923)
    static let goldDim = Color(hex: 0x8A7015)
    static let bg = Color(hex: 0x070B09)
    static let surface = Color(hex: 0x0E1611)
    static let surfaceHigh = Color(hex: 0x15201A)
    static let surfaceCard = Color(hex: 0x101A14)
    static let textPrimary = Color(hex: 0xF2F7F4)
    static let textSecondary = Color(hex: 0x9FB3A8)
    static let textTertiary = Color(hex: 0x66796E)
    static let outline = Color(hex: 0x24312A)
    static let danger = Color(hex: 0xFF6B6B)
}

// ============================================================
// خط Tajawal العربي — بأوزان ثلاثة
// ============================================================

enum ShashaFont {
    static func register() {
        for name in ["tajawal_regular", "tajawal_medium", "tajawal_bold"] {
            guard let url = Bundle.main.url(forResource: name, withExtension: "ttf") else { continue }
            CTFontManagerRegisterFontsForURL(url as CFURL, .process, nil)
        }
    }

    static func ui(_ size: CGFloat, weight: UIFont.Weight = .regular) -> UIFont {
        if let f = UIFont(name: family(for: weight), size: size) { return f }
        return UIFont.systemFont(ofSize: size, weight: weight)
    }

    private static func family(for weight: UIFont.Weight) -> String {
        switch weight {
        case .bold, .semibold, .heavy: return "Tajawal-Bold"
        case .medium: return "Tajawal-Medium"
        default: return "Tajawal-Regular"
        }
    }
}

// نصوص بالهوية
struct ShashaText: View {
    let text: String
    var size: CGFloat = 15
    var weight: UIFont.Weight = .regular
    var color: Color = .textPrimary

    init(_ text: String, size: CGFloat = 15, weight: UIFont.Weight = .regular, color: Color = .textPrimary) {
        self.text = text
        self.size = size
        self.weight = weight
        self.color = color
    }

    var body: some View {
        Text(text)
            .font(Font(ShashaFont.ui(size, weight: weight)))
            .foregroundColor(color)
    }
}

// ============================================================
// اتجاه الواجهة حسب اللغة — عربي RTL افتراضياً
// ============================================================

struct RTLModifier: ViewModifier {
    @EnvironmentObject var session: SessionStore

    func body(content: Content) -> some View {
        content
            .environment(\.layoutDirection, session.isArabic ? .rightToLeft : .leftToRight)
    }
}

extension View {
    func shashaRTL() -> some View {
        modifier(RTLModifier())
    }
}
