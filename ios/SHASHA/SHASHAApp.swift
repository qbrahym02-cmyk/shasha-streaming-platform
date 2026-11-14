import SwiftUI
import AVFoundation

@main
struct SHASHAApp: App {
    @StateObject private var session = SessionStore.shared

    init() {
        ShashaFont.register()

        // جلسة صوت التشغيل — تتيح استمرار الصوت في الخلفية وشاشة القفل
        do {
            try AVAudioSession.sharedInstance().setCategory(.playback, mode: .moviePlayback)
            try AVAudioSession.sharedInstance().setActive(true)
        } catch {
            // لا يمنع التشغيل — فقط ميزات الخلفية قد تتأثر
        }
    }

    var body: some Scene {
        WindowGroup {
            RootView()
                .environmentObject(session)
                .preferredColorScheme(.dark)
                .tint(.emerald)
        }
    }
}
