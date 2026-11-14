import SwiftUI
import UIKit

// ============================================================
// مكونات مشتركة — بطاقات، صفوف، شارات، حالات تحميل وخطأ
// ============================================================

// MARK: - شبكة أفاتار ملونة (الحرف الأول)

struct AvatarView: View {
    let name: String
    let colorHex: String
    var size: CGFloat = 44

    var body: some View {
        ZStack {
            Circle()
                .fill(Color(hex: UInt32(colorHex.dropFirst().padding(toLength: 6, withPad: "0", startingAt: 0), radix: 16) ?? 0x00D26A).opacity(0.22))
            ShashaText(String(name.prefix(1)), size: size * 0.42, weight: .bold, color: Color(hex: UInt32(colorHex.dropFirst().padding(toLength: 6, withPad: "0", startingAt: 0), radix: 16) ?? 0x00D26A))
        }
        .frame(width: size, height: size)
    }
}

// MARK: - شارة VIP الذهبية

struct VipBadge: View {
    var compact: Bool = false

    var body: some View {
        ShashaText("VIP", size: compact ? 9 : 11, weight: .bold, color: .black)
            .padding(.horizontal, compact ? 5 : 7)
            .padding(.vertical, compact ? 2 : 3)
            .background(
                RoundedRectangle(cornerRadius: 5)
                    .fill(LinearGradient(colors: [.gold, Color(hex: 0xF5D060)], startPoint: .topLeading, endPoint: .bottomTrailing))
            )
    }
}

// MARK: - شارة "قريباً"

struct SoonBadge: View {
    var body: some View {
        ShashaText(tr("coming_soon"), size: 9, weight: .bold, color: .emerald)
            .padding(.horizontal, 6)
            .padding(.vertical, 3)
            .background(Capsule().stroke(Color.emerald, lineWidth: 1))
            .background(Capsule().fill(Color.black.opacity(0.55)))
    }
}

// MARK: - بطاقة ملصق (Poster)

struct PosterCard: View {
    let title: Title
    var width: CGFloat = 128
    var showTitle: Bool = true
    let onTap: () -> Void

    var body: some View {
        Button(action: onTap) {
            VStack(alignment: .leading, spacing: 6) {
                ZStack(alignment: .topLeading) {
                    RemoteImage(url: APIClient.imageUrl(title.poster))
                        .frame(width: width, height: width * 1.5)
                        .clipShape(RoundedRectangle(cornerRadius: 10))

                    HStack(spacing: 4) {
                        if title.isPremium { VipBadge(compact: true) }
                        if !title.isReleased { SoonBadge() }
                    }
                    .padding(6)

                    if title.progressPct > 0 && title.progressPct < 100 {
                        VStack {
                            Spacer()
                            GeometryReader { geo in
                                ZStack(alignment: .leading) {
                                    Capsule().fill(Color.white.opacity(0.25))
                                    Capsule().fill(Color.emerald)
                                        .frame(width: geo.size.width * title.progressPct / 100.0)
                                }
                            }
                            .frame(height: 3)
                            .padding(.horizontal, 4)
                            .padding(.bottom, 4)
                        }
                    }
                }
                .frame(width: width, height: width * 1.5)

                if showTitle {
                    ShashaText(title.name(SessionStore.shared.isArabic), size: 12, weight: .medium, color: .textPrimary)
                        .lineLimit(1)
                    if let year = title.year {
                        ShashaText(String(year), size: 10, color: .textTertiary)
                    }
                }
            }
            .frame(width: width)
        }
        .buttonStyle(.plain)
    }
}

// MARK: - صف أفقي من الملصقات

struct PosterRow: View {
    let heading: String
    let items: [Title]
    let onTap: (Title) -> Void

    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            ShashaText(heading, size: 18, weight: .bold)
                .padding(.horizontal, 16)
            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: 10) {
                    ForEach(items) { item in
                        PosterCard(title: item, width: 118) { onTap(item) }
                    }
                }
                .padding(.horizontal, 16)
            }
        }
    }
}

// MARK: - صورة عن بعد مع تخزين مؤقت

final class ImageCache {
    static let shared = NSCache<NSURL, UIImage>()
}

struct RemoteImage: View {
    let url: URL?
    @State private var image: UIImage?

    var body: some View {
        ZStack {
            RoundedRectangle(cornerRadius: 10)
                .fill(Color.surfaceCard)
            if let image {
                Image(uiImage: image)
                    .resizable()
                    .scaledToFill()
            } else {
                Image(systemName: "film")
                    .font(.system(size: 22))
                    .foregroundColor(.textTertiary)
            }
        }
        .task(id: url) {
            await load()
        }
    }

    private func load() async {
        guard let url else { return }
        if let cached = ImageCache.shared.object(forKey: url as NSURL) {
            image = cached
            return
        }
        do {
            let (data, _) = try await URLSession.shared.data(from: url)
            guard let loaded = UIImage(data: data) else { return }
            ImageCache.shared.setObject(loaded, forKey: url as NSURL)
            image = loaded
        } catch {
            // ابق على العنصر البديل
        }
    }
}

// MARK: - حالة تحميل

struct LoadingState: View {
    var text: String = ""

    var body: some View {
        VStack(spacing: 14) {
            ProgressView()
                .tint(.emerald)
                .scaleEffect(1.2)
            if !text.isEmpty {
                ShashaText(text, size: 13, color: .textSecondary)
            }
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
    }
}

// MARK: - حالة خطأ مع إعادة محاولة

struct ErrorState: View {
    let message: String
    let retry: () -> Void

    var body: some View {
        VStack(spacing: 14) {
            Image(systemName: "wifi.exclamationmark")
                .font(.system(size: 34))
                .foregroundColor(.textTertiary)
            ShashaText(message, size: 14, color: .textSecondary)
                .multilineTextAlignment(.center)
                .padding(.horizontal, 32)
            Button {
                retry()
            } label: {
                ShashaText(tr("retry"), size: 14, weight: .bold, color: .black)
                    .padding(.horizontal, 22)
                    .padding(.vertical, 10)
                    .background(Capsule().fill(Color.emerald))
            }
            .buttonStyle(.plain)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
    }
}

// MARK: - زر رئيسي

struct PrimaryButton: View {
    let label: String
    var loading: Bool = false
    var tint: Color = .emerald
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            HStack(spacing: 8) {
                if loading {
                    ProgressView()
                        .tint(.black)
                        .scaleEffect(0.9)
                }
                ShashaText(label, size: 15, weight: .bold, color: .black)
            }
            .frame(maxWidth: .infinity)
            .padding(.vertical, 14)
            .background(Capsule().fill(tint))
        }
        .buttonStyle(.plain)
        .disabled(loading)
        .opacity(loading ? 0.7 : 1)
    }
}

// MARK: - صف تصنيف (chip)

struct GenreChip: View {
    let text: String
    var selected: Bool = false
    let onTap: () -> Void

    var body: some View {
        Button(action: onTap) {
            ShashaText(text, size: 13, weight: .medium, color: selected ? .black : .textSecondary)
                .padding(.horizontal, 16)
                .padding(.vertical, 8)
                .background(Capsule().fill(selected ? Color.emerald : Color.surfaceHigh))
        }
        .buttonStyle(.plain)
    }
}

// MARK: - شعار شاشة

struct ShashaLogo: View {
    var size: CGFloat = 28

    var body: some View {
        HStack(spacing: 8) {
            ZStack {
                RoundedRectangle(cornerRadius: 6)
                    .stroke(Color.emerald, lineWidth: 2)
                    .frame(width: size, height: size * 0.8)
                Image(systemName: "play.fill")
                    .font(.system(size: size * 0.34))
                    .foregroundColor(.gold)
            }
            ShashaText(SessionStore.shared.isArabic ? "شاشة" : "SHASHA", size: size * 0.62, weight: .bold, color: .textPrimary)
        }
    }
}
