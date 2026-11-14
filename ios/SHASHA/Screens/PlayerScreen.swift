import SwiftUI
import UIKit
import AVKit
import MediaPlayer

// ============================================================
// المشغل — AVPlayer مع HLS متكيف + تحكم كامل:
// سحب/سرعة/جودة/PiP/حلقات/استئناف/شاشة القفل والتشغيل الخلفي
// ============================================================

struct PlayerScreen: View {
    let slug: String
    let episodeId: String?

    @EnvironmentObject var router: Router
    @EnvironmentObject var session: SessionStore
    @Environment(\.dismiss) private var dismiss

    // المشغل
    @StateObject private var playerHolder = PlayerHolder()
    @State private var source: PlaySource?
    @State private var state: LoadState = .loading

    // التحكم
    @State private var controlsVisible: Bool = true
    @State private var showEpisodes: Bool = false
    @State private var showQuality: Bool = false
    @State private var showSpeed: Bool = false
    @State private var seekPos: Double = 0

    enum LoadState {
        case loading, ready, error(String), vipBlock, authBlock
    }

    var body: some View {
        ZStack {
            Color.black.ignoresSafeArea()

            switch state {
            case .loading:
                ProgressView()
                    .tint(.emerald)
                    .scaleEffect(1.3)

            case .ready:
                PlayerLayerView(player: playerHolder.player) { layer in
                    playerHolder.attachPiPLayer(layer)
                }
                .ignoresSafeArea()
                .onTapGesture { withAnimation(.easeInOut(duration: 0.25)) { controlsVisible.toggle() } }
                controlsOverlay

            case .error(let message):
                playerError(message, icon: "exclamationmark.triangle", showVip: false)

            case .vipBlock:
                playerError(tr("player_error_vip"), icon: "crown.fill", showVip: true)

            case .authBlock:
                playerError(tr("player_error_auth"), icon: "person.crop.circle", showVip: false, auth: true)
            }
        }
        .statusBarHidden(true)
        .persistentSystemOverlays(.hidden)
        .toolbar(.hidden, for: .tabBar)
        .toolbar(.hidden, for: .navigationBar)
        .onAppear { Task { await load() } }
        .onDisappear { playerHolder.shutdown() }
        .onReceive(NotificationCenter.default.publisher(for: .shashaNextEpisode)) { note in
            if let next = note.object as? String {
                Task { await load(episode: next) }
            }
        }
    }

    // MARK: - رسالة خطأ

    private func playerError(_ message: String, icon: String, showVip: Bool, auth: Bool = false) -> some View {
        VStack(spacing: 16) {
            Image(systemName: icon)
                .font(.system(size: 40))
                .foregroundColor(showVip ? .gold : .textSecondary)
            ShashaText(message, size: 15, color: .textSecondary)
                .multilineTextAlignment(.center)
                .padding(.horizontal, 36)

            HStack(spacing: 10) {
                Button {
                    dismiss()
                } label: {
                    ShashaText(tr("cancel"), size: 14, weight: .bold, color: .textPrimary)
                        .padding(.horizontal, 24)
                        .padding(.vertical, 11)
                        .background(Capsule().stroke(Color.outline, lineWidth: 1))
                }
                .buttonStyle(.plain)

                if showVip {
                    Button {
                        playerHolder.shutdown()
                        router.go(.plans)
                    } label: {
                        ShashaText(tr("go_vip"), size: 14, weight: .bold, color: .black)
                            .padding(.horizontal, 24)
                            .padding(.vertical, 11)
                            .background(Capsule().fill(Color.gold))
                    }
                    .buttonStyle(.plain)
                } else if auth {
                    Button {
                        playerHolder.shutdown()
                        router.go(.auth(mode: "login"))
                    } label: {
                        ShashaText(tr("login"), size: 14, weight: .bold, color: .black)
                            .padding(.horizontal, 24)
                            .padding(.vertical, 11)
                            .background(Capsule().fill(Color.emerald))
                    }
                    .buttonStyle(.plain)
                } else {
                    Button {
                        Task { await load() }
                    } label: {
                        ShashaText(tr("retry"), size: 14, weight: .bold, color: .black)
                            .padding(.horizontal, 24)
                            .padding(.vertical, 11)
                            .background(Capsule().fill(Color.emerald))
                    }
                    .buttonStyle(.plain)
                }
            }
        }
    }

    // MARK: - طبقة التحكم

    private var controlsOverlay: some View {
        VStack(spacing: 0) {
            // الترويسة
            HStack(spacing: 14) {
                Button {
                    playerHolder.persistProgress(source: source)
                    dismiss()
                } label: {
                    Image(systemName: session.isArabic ? "chevron.right" : "chevron.left")
                        .font(.system(size: 17, weight: .semibold))
                        .foregroundColor(.white)
                }
                .buttonStyle(.plain)

                VStack(alignment: .leading, spacing: 2) {
                    ShashaText(source.map { $0.titleAr } ?? "", size: 16, weight: .bold)
                        .lineLimit(1)
                    if let ep = source?.episodeNameAr, !ep.isEmpty {
                        ShashaText(ep, size: 12, color: .textSecondary)
                    }
                }
                Spacer()

                if let src = source, !src.episodes.isEmpty {
                    Button {
                        withAnimation { showEpisodes = true }
                    } label: {
                        Image(systemName: "square.stack.3d.up")
                            .font(.system(size: 16))
                            .foregroundColor(.white)
                    }
                    .buttonStyle(.plain)
                }
            }
            .padding(.horizontal, 18)
            .padding(.top, 10)
            .opacity(controlsVisible ? 1 : 0)

            Spacer()

            // أزرار الوسط
            HStack(spacing: 46) {
                // -10 ثوانٍ
                Button {
                    playerHolder.skip(-10)
                } label: {
                    Image(systemName: "gobackward.10")
                        .font(.system(size: 30, weight: .medium))
                        .foregroundColor(.white)
                }
                .buttonStyle(.plain)

                Button {
                    playerHolder.togglePlay()
                    withAnimation(.easeInOut(duration: 0.25)) { controlsVisible = true }
                    scheduleHide()
                } label: {
                    Image(systemName: playerHolder.isPlaying ? "pause.fill" : "play.fill")
                        .font(.system(size: 44, weight: .bold))
                        .foregroundColor(.white)
                }
                .buttonStyle(.plain)

                // +10 ثوانٍ
                Button {
                    playerHolder.skip(10)
                } label: {
                    Image(systemName: "goforward.10")
                        .font(.system(size: 30, weight: .medium))
                        .foregroundColor(.white)
                }
                .buttonStyle(.plain)
            }
            .opacity(controlsVisible ? 1 : 0)

            Spacer()

            // شريط السحب والسفلية
            VStack(spacing: 6) {
                Slider(
                    value: Binding(
                        get: { playerHolder.isScrubbing ? seekPos : playerHolder.positionSec },
                        set: { newValue in
                            seekPos = newValue
                            playerHolder.isScrubbing = true
                        }
                    ),
                    in: 0...max(playerHolder.durationSec, 0.1)
                ) { editing in
                    if !editing {
                        playerHolder.seek(to: seekPos)
                        playerHolder.isScrubbing = false
                    }
                }
                .tint(.emerald)

                HStack {
                    ShashaText(fmtTime(playerHolder.isScrubbing ? seekPos : playerHolder.positionSec), size: 11, color: .white.opacity(0.85))
                    Spacer()
                    ShashaText("-" + fmtTime(max(0, playerHolder.durationSec - (playerHolder.isScrubbing ? seekPos : playerHolder.positionSec))), size: 11, color: .white.opacity(0.85))
                }

                // صف الأدوات
                HStack(spacing: 22) {
                    // السرعة
                    Button { withAnimation { showSpeed.toggle() } } label: {
                        ShashaText(playerHolder.speedLabel, size: 13, weight: .bold, color: .white)
                    }
                    .buttonStyle(.plain)

                    // الجودة
                    Button { withAnimation { showQuality.toggle() } } label: {
                        HStack(spacing: 4) {
                            Image(systemName: "gauge.with.dots.needle.33percent")
                                .font(.system(size: 13))
                            ShashaText(playerHolder.qualityLabel, size: 13, weight: .bold)
                        }
                        .foregroundColor(.white)
                    }
                    .buttonStyle(.plain)

                    Spacer()

                    // الحلقة التالية
                    if let next = source?.nextEpisodeId, next.isEmpty == false {
                        Button {
                            playerHolder.persistProgress(source: source)
                            Task { await load(episode: next) }
                        } label: {
                            HStack(spacing: 5) {
                                Image(systemName: "forward.end.fill").font(.system(size: 13))
                                ShashaText(tr("next_episode"), size: 12, weight: .bold)
                            }
                            .foregroundColor(.white)
                        }
                        .buttonStyle(.plain)
                    }

                    // PiP
                    Button {
                        playerHolder.startPiP()
                    } label: {
                        Image(systemName: "pip.enter")
                            .font(.system(size: 16))
                            .foregroundColor(.white)
                    }
                    .buttonStyle(.plain)
                }
                .padding(.bottom, 14)
            }
            .padding(.horizontal, 18)
            .background(
                LinearGradient(colors: [.clear, .black.opacity(0.72)], startPoint: .top, endPoint: .bottom)
                    .ignoresSafeArea(edges: .bottom)
            )
            .opacity(controlsVisible ? 1 : 0)
        }

        // قائمة الحلقات
        .sheet(isPresented: $showEpisodes) {
            episodesSheet
                .presentationDetents([.medium, .large])
        }

        // قائمة السرعة
        .overlay(alignment: .bottomLeading) {
            if showSpeed {
                VStack(alignment: .leading, spacing: 2) {
                    ForEach([0.5, 0.75, 1.0, 1.25, 1.5, 2.0], id: \.self) { rate in
                        Button {
                            playerHolder.setSpeed(rate)
                            withAnimation { showSpeed = false }
                        } label: {
                            ShashaText(rate == 1.0 ? "1x" : String(format: "%g", rate) + "x",
                                       size: 13, weight: .medium,
                                       color: playerHolder.rate == rate ? .emerald : .textPrimary)
                                .frame(width: 64, alignment: .center)
                                .padding(.vertical, 8)
                        }
                        .buttonStyle(.plain)
                    }
                }
                .background(RoundedRectangle(cornerRadius: 12).fill(Color.surfaceHigh))
                .padding(.leading, 18)
                .padding(.bottom, 70)
                .transition(.opacity)
            }
        }

        // قائمة الجودة
        .overlay(alignment: .bottomLeading) {
            if showQuality {
                VStack(alignment: .leading, spacing: 2) {
                    ForEach(PlayerHolder.qualities, id: \.label) { q in
                        Button {
                            playerHolder.setQuality(q)
                            withAnimation { showQuality = false }
                        } label: {
                            ShashaText(q.label, size: 13, weight: .medium,
                                       color: playerHolder.selectedQuality?.label == q.label ? .emerald : .textPrimary)
                                .frame(width: 96, alignment: .center)
                                .padding(.vertical, 8)
                        }
                        .buttonStyle(.plain)
                    }
                }
                .background(RoundedRectangle(cornerRadius: 12).fill(Color.surfaceHigh))
                .padding(.leading, 18)
                .padding(.bottom, 70)
                .transition(.opacity)
            }
        }
    }

    // MARK: - قائمة الحلقات

    private var episodesSheet: some View {
        ZStack {
            Color.bg.ignoresSafeArea()
            VStack(alignment: .leading, spacing: 14) {
                ShashaText(tr("episodes"), size: 19, weight: .bold)
                    .padding(.top, 20)
                ScrollView(showsIndicators: false) {
                    VStack(spacing: 8) {
                        ForEach(source?.episodes ?? []) { ep in
                            Button {
                                showEpisodes = false
                                playerHolder.persistProgress(source: source)
                                Task { await load(episode: ep.id) }
                            } label: {
                                HStack(spacing: 12) {
                                    ZStack {
                                        RoundedRectangle(cornerRadius: 8).fill(Color.surfaceHigh)
                                            .frame(width: 84, height: 48)
                                        if ep.id == source?.episodeId {
                                            Image(systemName: "waveform")
                                                .foregroundColor(.emerald)
                                        } else {
                                            Image(systemName: "play.circle.fill")
                                                .foregroundColor(.emerald)
                                        }
                                    }
                                    VStack(alignment: .leading, spacing: 3) {
                                        ShashaText("\(ep.number). \(ep.name(session.isArabic))", size: 14, weight: .medium)
                                            .lineLimit(1)
                                        if let d = ep.durationMin {
                                            ShashaText("\(d) \(tr("minutes"))", size: 11, color: .textTertiary)
                                        }
                                    }
                                    Spacer()
                                    if ep.isPremium { VipBadge(compact: true) }
                                }
                                .padding(10)
                                .background(
                                    RoundedRectangle(cornerRadius: 12)
                                        .fill(ep.id == source?.episodeId ? Color.emerald.opacity(0.12) : Color.surfaceCard)
                                )
                            }
                            .buttonStyle(.plain)
                        }
                    }
                    .padding(.horizontal, 16)
                    .padding(.bottom, 20)
                }
            }
        }
    }

    // MARK: - منطق

    private func load(episode: String? = nil) async {
        let target = episode ?? episodeId
        state = .loading
        playerHolder.stop()

        let result = await APIClient.shared.play(slug: slug, episodeId: target)
        switch result {
        case .ok(let resp):
            if let src = resp.data {
                source = src
                state = .ready
                playerHolder.start(source: src)
                scheduleHide()
            } else {
                state = .error(resp.error ?? tr("player_error_source"))
            }
        case .err(let message, let code):
            switch code {
            case "vip_required": state = .vipBlock
            case "auth_required": state = .authBlock
            default:
                state = .error(code == NET_CODE_NETWORK ? tr("error_network") : (message.isEmpty ? tr("player_error_source") : message))
            }
        }
    }

    private func scheduleHide() {
        Task {
            try? await Task.sleep(nanoseconds: 3_500_000_000)
            withAnimation(.easeInOut(duration: 0.3)) { controlsVisible = false }
        }
    }

    private func fmtTime(_ sec: Double) -> String {
        guard sec.isFinite, sec >= 0 else { return "0:00" }
        let s = Int(sec)
        let h = s / 3600
        let m = (s % 3600) / 60
        let r = s % 60
        return h > 0 ? String(format: "%d:%02d:%02d", h, m, r) : String(format: "%d:%02d", m, r)
    }
}

// MARK: - طبقة الفيديو الأصلية

struct PlayerLayerView: UIViewRepresentable {
    let player: AVPlayer
    var onLayerReady: (AVPlayerLayer) -> Void = { _ in }

    final class PlayerUIView: UIView {
        override static var layerClass: AnyClass { AVPlayerLayer.self }
        var playerLayer: AVPlayerLayer { layer as! AVPlayerLayer }
    }

    func makeUIView(context: Context) -> PlayerUIView {
        let view = PlayerUIView()
        view.playerLayer.player = player
        view.playerLayer.videoGravity = .resizeAspect
        view.backgroundColor = .black
        DispatchQueue.main.async { [weak view] in
            if let view { onLayerReady(view.playerLayer) }
        }
        return view
    }

    func updateUIView(_ uiView: PlayerUIView, context: Context) {
        if uiView.playerLayer.player !== player {
            uiView.playerLayer.player = player
        }
    }
}

// MARK: - حامل المشغل — التوقيت/التقدم/شاشة القفل/PiP

@MainActor
final class PlayerHolder: NSObject, ObservableObject {
    struct QualityOption {
        let label: String
        let peakBitRate: Double // 0 = تلقائي
    }

    static let qualities: [QualityOption] = [
        .init(label: tr("quality_auto"), peakBitRate: 0),
        .init(label: "1080p", peakBitRate: 4_500_000),
        .init(label: "720p", peakBitRate: 2_500_000),
        .init(label: "480p", peakBitRate: 1_200_000),
        .init(label: "360p", peakBitRate: 700_000),
    ]

    let player = AVPlayer()
    private var pipController: AVPictureInPictureController?
    private var timeObserver: Any?
    private var progressTimer: Timer?
    private var currentSource: PlaySource?
    private var endedObserver: NSObjectProtocol?

    @Published var isPlaying: Bool = false
    @Published var positionSec: Double = 0
    @Published var durationSec: Double = 0
    @Published var rate: Double = 1.0
    @Published var selectedQuality: QualityOption?
    var isScrubbing: Bool = false

    var speedLabel: String { rate == 1.0 ? "1x" : String(format: "%g", rate) + "x" }
    var qualityLabel: String { selectedQuality?.label ?? tr("quality_auto") }

    override init() {
        super.init()
        selectedQuality = Self.qualities.first
    }

    // MARK: - بدء التشغيل

    func start(source: PlaySource) {
        cleanObservers()
        currentSource = source
        guard let url = URL(string: source.sourceUrl) else { return }

        let item = AVPlayerItem(url: url)
        player.automaticallyWaitsToMinimizeStalling = true
        player.replaceCurrentItem(with: item)

        // استئناف من الموضع المحفوظ
        if source.resumeAt > 3 {
            let resumeCM = CMTime(seconds: source.resumeAt, preferredTimescale: 600)
            player.seek(to: resumeCM) { [weak self] _ in
                Task { @MainActor [weak self] in
                    self?.player.play()
                }
            }
        } else {
            player.play()
        }

        isPlaying = true
        applySpeed(rate)

        // مراقبة الوقت
        timeObserver = player.addPeriodicTimeObserver(
            forInterval: CMTime(seconds: 0.5, preferredTimescale: 600),
            queue: .main
        ) { [weak self] time in
            Task { @MainActor [weak self] in
                guard let self, !self.isScrubbing else { return }
                self.positionSec = time.seconds
                if let d = self.player.currentItem?.duration.seconds, d.isFinite, d > 0 {
                    self.durationSec = d
                }
            }
        }

        // مراقبة نهاية الحلقة → التالية تلقائياً
        endedObserver = NotificationCenter.default.addObserver(
            forName: .AVPlayerItemDidPlayToEndTime,
            object: item,
            queue: .main
        ) { [weak self] _ in
            Task { @MainActor [weak self] in
                guard let self, let src = self.currentSource, let next = src.nextEpisodeId, !next.isEmpty else { return }
                NotificationCenter.default.post(name: .shashaNextEpisode, object: next)
            }
        }

        setupRemoteControls(source: source)

        // حفظ التقدم كل 15 ثانية
        progressTimer = Timer.scheduledTimer(withTimeInterval: 15, repeats: true) { [weak self] _ in
            Task { @MainActor [weak self] in
                self?.fireProgressSave()
            }
        }
    }

    func stop() {
        player.pause()
    }

    func shutdown() {
        fireProgressSave()
        cleanObservers()
        MPRemoteCommandCenter.shared().pauseCommand.removeTarget(nil)
        MPRemoteCommandCenter.shared().playCommand.removeTarget(nil)
        MPRemoteCommandCenter.shared().changePlaybackPositionCommand.removeTarget(nil)
        player.replaceCurrentItem(with: nil)
        isPlaying = false
    }

    /// إزالة مراقبي الوقت/النهاية/مؤقّت الحفظ قبل أي بدء جديد
    private func cleanObservers() {
        progressTimer?.invalidate()
        progressTimer = nil
        if let observer = timeObserver {
            player.removeTimeObserver(observer)
            timeObserver = nil
        }
        if let observer = endedObserver {
            NotificationCenter.default.removeObserver(observer)
            endedObserver = nil
        }
    }

    // MARK: - التحكم

    func togglePlay() {
        if isPlaying {
            player.pause()
            isPlaying = false
        } else {
            player.play()
            isPlaying = true
        }
        updateNowPlaying()
    }

    func skip(_ seconds: Double) {
        let target = positionSec + seconds
        seek(to: max(0, min(target, durationSec)))
    }

    func seek(to seconds: Double) {
        let cm = CMTime(seconds: seconds, preferredTimescale: 600)
        player.seek(to: cm, toleranceBefore: .zero, toleranceAfter: .zero) { [weak self] _ in
            Task { @MainActor [weak self] in
                self?.positionSec = seconds
                self?.updateNowPlaying()
            }
        }
    }

    func setSpeed(_ newRate: Double) {
        rate = newRate
        applySpeed(newRate)
    }

    private func applySpeed(_ rate: Double) {
        player.rate = isPlaying ? Float(rate) : 0
        player.defaultRate = Float(rate)
    }

    func setQuality(_ q: QualityOption) {
        selectedQuality = q
        player.currentItem?.preferredPeakBitRate = q.peakBitRate
    }

    func startPiP() {
        guard AVPictureInPictureController.isPictureInPictureSupported(),
              let controller = pipController else { return }
        controller.startPictureInPicture()
    }

    // MARK: - شاشة القفل / مركز التحكم

    private func setupRemoteControls(source: PlaySource) {
        let center = MPRemoteCommandCenter.shared()

        // إزالة الأهداف السابقة أولاً (عند تبديل الحلقات)
        center.playCommand.removeTarget(nil)
        center.pauseCommand.removeTarget(nil)
        center.changePlaybackPositionCommand.removeTarget(nil)

        center.playCommand.addTarget { [weak self] _ in
            Task { @MainActor [weak self] in
                self?.player.play()
                self?.isPlaying = true
                self?.updateNowPlaying()
            }
            return .success
        }
        center.pauseCommand.addTarget { [weak self] _ in
            Task { @MainActor [weak self] in
                self?.player.pause()
                self?.isPlaying = false
                self?.updateNowPlaying()
            }
            return .success
        }
        center.changePlaybackPositionCommand.addTarget { [weak self] event in
            guard let posEvent = event as? MPChangePlaybackPositionCommandEvent else { return .commandFailed }
            Task { @MainActor [weak self] in
                self?.seek(to: posEvent.positionTime)
            }
            return .success
        }

        updateNowPlaying()
    }

    private func updateNowPlaying() {
        guard let src = currentSource else { return }
        var info: [String: Any] = [
            MPMediaItemPropertyTitle: src.episodeNameAr ?? src.titleAr,
            MPMediaItemPropertyArtist: src.titleAr,
            MPMediaItemPropertyPlaybackDuration: durationSec,
            MPNowPlayingInfoPropertyElapsedPlaybackTime: positionSec,
            MPNowPlayingInfoPropertyPlaybackRate: isPlaying ? rate : 0,
        ]
        NowPlayingCenter.update(info: &info)
    }

    // MARK: - PiP

    func attachPiPLayer(_ layer: AVPlayerLayer) {
        guard AVPictureInPictureController.isPictureInPictureSupported() else { return }
        pipController = AVPictureInPictureController(playerLayer: layer)
    }

    // MARK: - حفظ التقدم

    nonisolated func persistProgress(source: PlaySource?) {
        Task { @MainActor [weak self] in
            self?.fireProgressSave()
        }
    }

    private func fireProgressSave() {
        guard let src = currentSource, durationSec > 0, positionSec > 5 else { return }
        let slug = src.titleSlug
        let ep = src.episodeId
        let pos = positionSec
        let dur = durationSec
        Task.detached {
            _ = await APIClient.shared.saveProgress(slug: slug, episodeId: ep, positionSec: pos, durationSec: dur)
        }
    }
}

extension Notification.Name {
    static let shashaNextEpisode = Notification.Name("shashaNextEpisode")
}

// MARK: - مركز معلومات التشغيل

@MainActor
enum NowPlayingCenter {
    static func update(info: inout [String: Any]) {
        MPNowPlayingInfoCenter.default().nowPlayingInfo = info
    }
}
