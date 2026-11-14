package com.shasha.app.ui.screens

import android.app.Activity
import android.app.PictureInPictureParams
import android.content.pm.ActivityInfo
import android.content.res.Configuration
import android.os.Build
import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.List
import androidx.compose.material.icons.filled.Lock
import androidx.compose.material.icons.filled.PlayArrow
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material.icons.filled.Settings
import androidx.compose.material3.Button
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.ModalBottomSheet
import androidx.compose.material3.Slider
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalConfiguration
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalView
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.viewinterop.AndroidView
import androidx.core.view.WindowCompat
import androidx.core.view.WindowInsetsCompat
import androidx.core.view.WindowInsetsControllerCompat
import androidx.navigation.NavHostController
import com.shasha.app.PlayerRuntime
import com.shasha.app.R
import com.shasha.app.data.Net
import com.shasha.app.data.PlaySource
import com.shasha.app.data.Repo
import com.shasha.app.goWatch
import com.shasha.app.ui.components.isArabic
import com.shasha.app.ui.components.netErrorText
import com.shasha.app.ui.icons.IconFullscreen
import com.shasha.app.ui.icons.IconPause
import com.shasha.app.ui.icons.IconSkipNext
import com.shasha.app.ui.icons.IconSkipPrev
import com.shasha.app.util.fmtTime
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import androidx.media3.common.C
import androidx.media3.common.MediaItem
import androidx.media3.common.MimeTypes
import androidx.media3.common.Player
import androidx.media3.common.TrackGroup
import androidx.media3.common.TrackSelectionOverride
import androidx.media3.common.Tracks
import androidx.media3.exoplayer.ExoPlayer
import androidx.media3.session.MediaSession
import androidx.media3.ui.AspectRatioFrameLayout
import androidx.media3.ui.PlayerView

// نطاق لتخزين التقدم بعد خروج الشاشة
private val saverScope = CoroutineScope(SupervisorJob() + Dispatchers.IO)

private sealed class PlayState {
    data object Loading : PlayState()
    data class Ready(val src: PlaySource) : PlayState()
    data class Error(val message: String, val code: String?) : PlayState()
}

@Composable
fun PlayerScreen(nav: NavHostController, slug: String, initialEpisode: String) {
    var episodeId by remember { mutableStateOf(initialEpisode) }
    var state by remember { mutableStateOf<PlayState>(PlayState.Loading) }

    LaunchedEffect(slug, episodeId) {
        state = PlayState.Loading
        state = when (val r = Repo.play(slug, episodeId)) {
            is Net.Ok -> PlayState.Ready(r.value)
            is Net.Err -> PlayState.Error(r.message, r.code)
        }
    }

    when (val s = state) {
        is PlayState.Loading -> Box(Modifier.fillMaxSize().background(Color.Black), contentAlignment = Alignment.Center) {
            CircularProgressIndicator(color = MaterialTheme.colorScheme.primary)
        }
        is PlayState.Error -> PlayErrorView(nav, s)
        is PlayState.Ready -> PlayerContent(
            nav = nav,
            src = s.src,
            onEpisodeChange = { episodeId = it },
        )
    }
}

// ============================================================
// شاشة الخطأ داخل المشغل
// ============================================================
@Composable
private fun PlayErrorView(nav: NavHostController, err: PlayState.Error) {
    val context = LocalContext.current
    Column(
        Modifier
            .fillMaxSize()
            .background(Color.Black)
            .padding(28.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center,
    ) {
        when (err.code) {
            "vip_required" -> {
                Icon(Icons.Filled.Lock, contentDescription = null, tint = MaterialTheme.colorScheme.secondary, modifier = Modifier.size(52.dp))
                Spacer(Modifier.height(16.dp))
                Text(stringResource(R.string.player_error_vip), color = Color.White, style = MaterialTheme.typography.headlineSmall, textAlign = TextAlign.Center)
                Spacer(Modifier.height(22.dp))
                Button(
                    onClick = { nav.navigate("vip") },
                    shape = RoundedCornerShape(12.dp),
                    colors = androidx.compose.material3.ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.secondary),
                ) { Text(stringResource(R.string.go_vip), color = MaterialTheme.colorScheme.onSecondary) }
            }
            "auth_required" -> {
                Text(stringResource(R.string.player_error_auth), color = Color.White, style = MaterialTheme.typography.headlineSmall, textAlign = TextAlign.Center)
                Spacer(Modifier.height(22.dp))
                Button(
                    onClick = { nav.navigate("auth") },
                    shape = RoundedCornerShape(12.dp),
                ) { Text(stringResource(R.string.login)) }
            }
            else -> {
                Text(
                    err.message.ifBlank { stringResource(R.string.player_error_source) },
                    color = Color.White,
                    style = MaterialTheme.typography.titleMedium,
                    textAlign = TextAlign.Center,
                )
                Spacer(Modifier.height(22.dp))
                Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                    Button(onClick = { nav.popBackStack() }, shape = RoundedCornerShape(12.dp)) {
                        Text(stringResource(R.string.details))
                    }
                    androidx.compose.material3.OutlinedButton(onClick = { nav.popBackStack() }, shape = RoundedCornerShape(12.dp)) {
                        Icon(Icons.Default.Refresh, contentDescription = null, modifier = Modifier.size(16.dp))
                        Spacer(Modifier.width(6.dp))
                        Text(stringResource(R.string.retry))
                    }
                }
            }
        }
    }
}

// ============================================================
// المشغل
// ============================================================
private data class QOption(val group: TrackGroup, val index: Int, val height: Int)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun PlayerContent(
    nav: NavHostController,
    src: PlaySource,
    onEpisodeChange: (String) -> Unit,
) {
    val context = LocalContext.current
    val activity = context as? Activity
    val view = LocalView.current
    val config = LocalConfiguration.current

    var retryKey by remember { mutableStateOf(0) }
    var exoPlayer by remember { mutableStateOf<ExoPlayer?>(null) }
    var session by remember { mutableStateOf<MediaSession?>(null) }
    var useFallback by remember { mutableStateOf(false) }
    var playerError by remember { mutableStateOf<String?>(null) }

    var isPlaying by remember { mutableStateOf(false) }
    var positionMs by remember { mutableStateOf(0L) }
    var durationMs by remember { mutableStateOf(0L) }
    var bufferedMs by remember { mutableStateOf(0L) }
    var controlsVisible by remember { mutableStateOf(true) }
    var landscape by remember { mutableStateOf(false) }
    var speed by remember { mutableStateOf(1f) }
    var qualityOptions by remember { mutableStateOf<List<QOption>>(emptyList()) }
    var selectedQuality by remember { mutableStateOf<QOption?>(null) }
    var showEpisodes by remember { mutableStateOf(false) }
    var showQuality by remember { mutableStateOf(false) }
    var showSpeed by remember { mutableStateOf(false) }
    var dragging by remember { mutableStateOf(false) }
    var dragPos by remember { mutableStateOf(0f) }

    val currentEpisodeId = src.episodeId ?: ""
    val isSeries = src.episodes.isNotEmpty()

    // ===== إنشاء/تحرير المشغل =====
    DisposableEffect(src.sourceUrl, src.episodeId, useFallback, retryKey) {
        val p = ExoPlayer.Builder(context).build()
        val uri = if (useFallback && !src.fallbackUrl.isNullOrBlank()) src.fallbackUrl else src.sourceUrl
        val item = MediaItem.Builder()
            .setUri(uri)
            .apply { if (src.sourceType == "hls") setMimeType(MimeTypes.APPLICATION_M3U8) }
            .build()
        p.setMediaItem(item)
        p.prepare()
        if (src.resumeAt > 0) p.seekTo((src.resumeAt * 1000).toLong())
        p.playWhenReady = true
        p.setPlaybackSpeed(speed)

        val listener = object : Player.Listener {
            override fun onIsPlayingChanged(playing: Boolean) {
                isPlaying = playing
                PlayerRuntime.playing = playing
            }

            override fun onPlaybackStateChanged(playbackState: Int) {
                if (playbackState == Player.STATE_READY) {
                    durationMs = p.duration.coerceAtLeast(0)
                    playerError = null
                }
                if (playbackState == Player.STATE_ENDED) {
                    val next = src.nextEpisodeId
                    if (next != null) onEpisodeChange(next) else nav.popBackStack()
                }
            }

            override fun onTracksChanged(tracks: Tracks) {
                val opts = ArrayList<QOption>()
                val seen = HashSet<Int>()
                for (g in tracks.groups) {
                    if (g.getType() != C.TRACK_TYPE_VIDEO) continue
                    for (i in 0 until g.length) {
                        if (g.isTrackSupported(i)) {
                            val h = g.getTrackFormat(i).height
                            if (h > 0 && seen.add(h)) opts.add(QOption(g.mediaTrackGroup, i, h))
                        }
                    }
                }
                qualityOptions = opts.sortedByDescending { it.height }
            }

            override fun onPlayerError(error: androidx.media3.common.PlaybackException) {
                if (!useFallback && !src.fallbackUrl.isNullOrBlank()) {
                    useFallback = true
                } else {
                    playerError = error.errorCodeName
                }
            }
        }
        p.addListener(listener)
        val s = try {
            MediaSession.Builder(context, p).build()
        } catch (_: Exception) {
            null
        }
        exoPlayer = p
        session = s
        PlayerRuntime.active = true

        // إبقاء الشاشة مضاءة
        activity?.window?.addFlags(android.view.WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON)

        onDispose {
            val pos = p.currentPosition
            val dur = p.duration.coerceAtLeast(0)
            saverScope.launch {
                Repo.saveProgress(src.titleSlug, currentEpisodeId.ifBlank { null }, pos / 1000.0, dur / 1000.0)
            }
            activity?.window?.clearFlags(android.view.WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON)
            s?.release()
            p.removeListener(listener)
            p.release()
            exoPlayer = null
            PlayerRuntime.active = false
            PlayerRuntime.playing = false
        }
    }

    // ===== مؤقّت تحديث الموضع =====
    LaunchedEffect(exoPlayer) {
        while (true) {
            exoPlayer?.let {
                if (!dragging) positionMs = it.currentPosition
                durationMs = it.duration.coerceAtLeast(0)
                bufferedMs = it.bufferedPosition
            }
            delay(400)
        }
    }

    // ===== حفظ دوري للتقدم كل 5 ثوانٍ =====
    LaunchedEffect(exoPlayer) {
        while (true) {
            delay(5000)
            exoPlayer?.let {
                if (it.duration > 0) {
                    saverScope.launch {
                        Repo.saveProgress(src.titleSlug, currentEpisodeId.ifBlank { null }, it.currentPosition / 1000.0, it.duration / 1000.0)
                    }
                }
            }
        }
    }

    // ===== إخفاء أدوات التحكم تلقائياً =====
    LaunchedEffect(controlsVisible, isPlaying) {
        if (controlsVisible && isPlaying) {
            delay(3500)
            controlsVisible = false
        }
    }

    // ===== الاتجاه ووضع الشاشة الكاملة =====
    LaunchedEffect(landscape) {
        val wc = activity?.window?.let { WindowCompat.getInsetsController(it, view) }
        if (landscape) {
            activity?.requestedOrientation = ActivityInfo.SCREEN_ORIENTATION_SENSOR_LANDSCAPE
            wc?.hide(WindowInsetsCompat.Type.systemBars())
            wc?.systemBarsBehavior = WindowInsetsControllerCompat.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE
        } else {
            activity?.requestedOrientation = ActivityInfo.SCREEN_ORIENTATION_PORTRAIT
            wc?.show(WindowInsetsCompat.Type.systemBars())
        }
    }

    // ===== دخول PiP تلقائياً (أندرويد 12+) =====
    if (Build.VERSION.SDK_INT >= 31) {
        LaunchedEffect(isPlaying) {
            try {
                activity?.setPictureInPictureParams(
                    PictureInPictureParams.Builder().setAutoEnterEnabled(isPlaying).build()
                )
            } catch (_: Exception) {
            }
        }
    }

    // استعادة الاتجاه عند الخروج
    DisposableEffect(Unit) {
        onDispose {
            activity?.requestedOrientation = ActivityInfo.SCREEN_ORIENTATION_UNSPECIFIED
            activity?.window?.let { WindowCompat.getInsetsController(it, view).show(WindowInsetsCompat.Type.systemBars()) }
        }
    }

    val player = exoPlayer

    Box(
        Modifier
            .fillMaxSize()
            .background(Color.Black)
    ) {
        // ===== سطح الفيديو =====
        AndroidView(
            factory = { ctx ->
                PlayerView(ctx).apply {
                    useController = false
                    resizeMode = AspectRatioFrameLayout.RESIZE_MODE_FIT
                }
            },
            update = { it.player = player },
            modifier = Modifier
                .fillMaxSize()
                .clickable { controlsVisible = !controlsVisible },
        )

        // ===== خطأ التشغيل =====
        if (playerError != null) {
            Column(
                Modifier.fillMaxSize().padding(24.dp),
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.Center,
            ) {
                Text(
                    stringResource(R.string.player_error_source),
                    color = Color.White,
                    style = MaterialTheme.typography.titleMedium,
                    textAlign = TextAlign.Center,
                )
                Spacer(Modifier.height(12.dp))
                Button(onClick = { playerError = null; useFallback = false; retryKey++ }) {
                    Text(stringResource(R.string.retry))
                }
            }
        }

        // ===== أدوات التحكم =====
        if (playerError == null) {
            // الشريط العلوي
            AnimatedVisibility(
                visible = controlsVisible,
                enter = fadeIn(),
                exit = fadeOut(),
                modifier = Modifier.align(Alignment.TopCenter),
            ) {
                Row(
                    Modifier
                        .fillMaxWidth()
                        .background(Brush.verticalGradient(0f to Color.Black.copy(alpha = 0.75f), 1f to Color.Transparent))
                        .padding(horizontal = 6.dp, vertical = 10.dp),
                    verticalAlignment = Alignment.CenterVertically,
                ) {
                    IconButton(onClick = { nav.popBackStack() }) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = null, tint = Color.White)
                    }
                    Column(Modifier.weight(1f)) {
                        Text(
                            if (isArabic()) src.titleAr else src.titleEn,
                            color = Color.White,
                            style = MaterialTheme.typography.titleMedium,
                            maxLines = 1,
                            overflow = TextOverflow.Ellipsis,
                        )
                        val epName = if (isArabic()) src.episodeNameAr else src.episodeNameEn
                        if (epName != null) {
                            Text(epName, color = Color.White.copy(alpha = 0.7f), style = MaterialTheme.typography.labelMedium, maxLines = 1)
                        }
                    }
                    if (isSeries) {
                        IconButton(onClick = { showEpisodes = true }) {
                            Icon(Icons.Default.List, contentDescription = stringResource(R.string.episodes), tint = Color.White)
                        }
                    }
                    IconButton(onClick = { showQuality = true }) {
                        Icon(Icons.Default.Settings, contentDescription = stringResource(R.string.quality), tint = Color.White)
                    }
                    TextButton(onClick = { showSpeed = true }) {
                        Text("${speed}×", color = Color.White, style = MaterialTheme.typography.titleMedium)
                    }
                    IconButton(onClick = { landscape = !landscape }) {
                        Icon(IconFullscreen, contentDescription = null, tint = Color.White)
                    }
                }
            }

            // أزرار الوسط
            AnimatedVisibility(
                visible = controlsVisible,
                enter = fadeIn(),
                exit = fadeOut(),
                modifier = Modifier.align(Alignment.Center),
            ) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(26.dp),
                ) {
                    IconButton(
                        onClick = { player?.seekTo((player.currentPosition - 10000).coerceAtLeast(0)) },
                        modifier = Modifier
                            .size(46.dp)
                            .clip(CircleShape)
                            .background(Color.White.copy(alpha = 0.14f)),
                    ) {
                        Icon(IconSkipPrev, contentDescription = "-10", tint = Color.White, modifier = Modifier.size(26.dp))
                    }
                    IconButton(
                        onClick = { player?.let { if (it.isPlaying) it.pause() else it.play() } },
                        modifier = Modifier
                            .size(72.dp)
                            .clip(CircleShape)
                            .background(MaterialTheme.colorScheme.primary),
                    ) {
                        Icon(
                            if (isPlaying) IconPause else Icons.Default.PlayArrow,
                            contentDescription = null,
                            tint = MaterialTheme.colorScheme.onPrimary,
                            modifier = Modifier.size(40.dp),
                        )
                    }
                    IconButton(
                        onClick = {
                            src.nextEpisodeId?.let { onEpisodeChange(it) }
                                ?: player?.seekTo((player.currentPosition + 10000).coerceAtMost(player.duration))
                        },
                        modifier = Modifier
                            .size(46.dp)
                            .clip(CircleShape)
                            .background(Color.White.copy(alpha = 0.14f)),
                    ) {
                        Icon(IconSkipNext, contentDescription = "+10", tint = Color.White, modifier = Modifier.size(26.dp))
                    }
                }
            }

            // الشريط السفلي (التقدم)
            AnimatedVisibility(
                visible = controlsVisible,
                enter = fadeIn(),
                exit = fadeOut(),
                modifier = Modifier.align(Alignment.BottomCenter),
            ) {
                Column(
                    Modifier
                        .fillMaxWidth()
                        .background(Brush.verticalGradient(0f to Color.Transparent, 1f to Color.Black.copy(alpha = 0.8f)))
                        .padding(horizontal = 16.dp, vertical = 8.dp),
                ) {
                    if (src.nextEpisodeId != null) {
                        TextButton(
                            onClick = { onEpisodeChange(src.nextEpisodeId!!) },
                            modifier = Modifier.align(Alignment.End),
                        ) {
                            Icon(IconSkipNext, contentDescription = null, tint = Color.White, modifier = Modifier.size(15.dp))
                            Spacer(Modifier.width(4.dp))
                            Text(stringResource(R.string.next_episode), color = Color.White, style = MaterialTheme.typography.labelLarge)
                        }
                    }
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Text(
                            fmtTime(if (dragging) dragPos.toLong() else positionMs),
                            color = Color.White,
                            style = MaterialTheme.typography.labelMedium,
                        )
                        Slider(
                            value = if (dragging) dragPos else positionMs.toFloat(),
                            onValueChange = {
                                dragging = true
                                dragPos = it
                            },
                            onValueChangeFinished = {
                                player?.seekTo(dragPos.toLong())
                                dragging = false
                            },
                            valueRange = 0f..maxOf(durationMs.toFloat(), 1f),
                            modifier = Modifier
                                .weight(1f)
                                .padding(horizontal = 10.dp),
                            colors = androidx.compose.material3.SliderDefaults.colors(
                                thumbColor = MaterialTheme.colorScheme.primary,
                                activeTrackColor = MaterialTheme.colorScheme.primary,
                                inactiveTrackColor = Color.White.copy(alpha = 0.3f),
                            ),
                        )
                        Text(fmtTime(durationMs), color = Color.White, style = MaterialTheme.typography.labelMedium)
                    }
                }
            }
        }

        // مؤشر تحميل أثناء التخزين المؤقت
        if (!isPlaying && playerError == null && player?.playbackState != Player.STATE_READY) {
            CircularProgressIndicator(
                color = MaterialTheme.colorScheme.primary,
                modifier = Modifier
                    .align(Alignment.Center)
                    .size(46.dp),
            )
        }
    }

    // ===== لوحة الحلقات =====
    if (showEpisodes && isSeries) {
        ModalBottomSheet(onDismissRequest = { showEpisodes = false }) {
            LazyColumn(Modifier.padding(bottom = 26.dp)) {
                item {
                    Text(
                        stringResource(R.string.episodes),
                        style = MaterialTheme.typography.titleLarge,
                        modifier = Modifier.padding(horizontal = 18.dp, vertical = 8.dp),
                    )
                }
                items(src.episodes, key = { it.id }) { ep ->
                    val isCurrent = ep.id == currentEpisodeId
                    Row(
                        Modifier
                            .fillMaxWidth()
                            .clickable {
                                showEpisodes = false
                                onEpisodeChange(ep.id)
                            }
                            .background(if (isCurrent) MaterialTheme.colorScheme.primaryContainer else androidx.compose.ui.graphics.Color.Transparent)
                            .padding(horizontal = 18.dp, vertical = 12.dp),
                        verticalAlignment = Alignment.CenterVertically,
                    ) {
                        Box(
                            Modifier
                                .size(34.dp)
                                .clip(CircleShape)
                                .background(MaterialTheme.colorScheme.surfaceContainerHigh),
                            contentAlignment = Alignment.Center,
                        ) {
                            Text("${ep.number}", color = MaterialTheme.colorScheme.primary, style = MaterialTheme.typography.labelLarge)
                        }
                        Column(Modifier.weight(1f).padding(horizontal = 12.dp)) {
                            Text(
                                if (isArabic()) ep.nameAr else ep.nameEn,
                                style = MaterialTheme.typography.titleMedium,
                                color = if (isCurrent) MaterialTheme.colorScheme.onPrimaryContainer else MaterialTheme.colorScheme.onSurface,
                            )
                            ep.durationMin?.let {
                                Text("$it ${stringResource(R.string.minutes)}", color = MaterialTheme.colorScheme.onSurfaceVariant, style = MaterialTheme.typography.labelMedium)
                            }
                        }
                        if (ep.isPremium) {
                            Text(stringResource(R.string.vip_badge), color = MaterialTheme.colorScheme.secondary, style = MaterialTheme.typography.labelMedium)
                        }
                    }
                }
            }
        }
    }

    // ===== لوحة الجودة =====
    if (showQuality) {
        ModalBottomSheet(onDismissRequest = { showQuality = false }) {
            Column(Modifier.padding(bottom = 26.dp)) {
                Text(
                    stringResource(R.string.quality),
                    style = MaterialTheme.typography.titleLarge,
                    modifier = Modifier.padding(horizontal = 18.dp, vertical = 8.dp),
                )
                QualityRow(stringResource(R.string.quality_auto), selectedQuality == null) {
                    player?.let { pl ->
                        pl.trackSelectionParameters = pl.trackSelectionParameters
                            .buildUpon()
                            .clearOverridesOfType(C.TRACK_TYPE_VIDEO)
                            .build()
                    }
                    selectedQuality = null
                    showQuality = false
                }
                qualityOptions.forEach { q ->
                    QualityRow("${q.height}p", selectedQuality?.height == q.height) {
                        player?.let { pl ->
                            pl.trackSelectionParameters = pl.trackSelectionParameters
                                .buildUpon()
                                .setOverrideForType(TrackSelectionOverride(q.group, q.index))
                                .build()
                        }
                        selectedQuality = q
                        showQuality = false
                    }
                }
                if (qualityOptions.isEmpty()) {
                    Text(
                        stringResource(R.string.quality_auto),
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                        modifier = Modifier.padding(18.dp),
                    )
                }
            }
        }
    }

    // ===== لوحة السرعة =====
    if (showSpeed) {
        ModalBottomSheet(onDismissRequest = { showSpeed = false }) {
            Column(Modifier.padding(bottom = 26.dp)) {
                Text(
                    stringResource(R.string.speed),
                    style = MaterialTheme.typography.titleLarge,
                    modifier = Modifier.padding(horizontal = 18.dp, vertical = 8.dp),
                )
                Row(
                    Modifier
                        .fillMaxWidth()
                        .padding(14.dp),
                    horizontalArrangement = Arrangement.SpaceEvenly,
                ) {
                    listOf(0.5f, 0.75f, 1f, 1.25f, 1.5f, 2f).forEach { s ->
                        TextButton(
                            onClick = {
                                speed = s
                                player?.setPlaybackSpeed(s)
                                showSpeed = false
                            },
                            modifier = Modifier
                                .clip(CircleShape)
                                .background(if (speed == s) MaterialTheme.colorScheme.primaryContainer else androidx.compose.ui.graphics.Color.Transparent),
                        ) {
                            Text(
                                "${s}×",
                                color = if (speed == s) MaterialTheme.colorScheme.onPrimaryContainer else MaterialTheme.colorScheme.onSurface,
                            )
                        }
                    }
                }
            }
        }
    }
}

@Composable
private fun QualityRow(label: String, selected: Boolean, onClick: () -> Unit) {
    Row(
        Modifier
            .fillMaxWidth()
            .clickable(onClick = onClick)
            .background(if (selected) MaterialTheme.colorScheme.primaryContainer else androidx.compose.ui.graphics.Color.Transparent)
            .padding(horizontal = 18.dp, vertical = 13.dp),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        Text(
            label,
            style = MaterialTheme.typography.titleMedium,
            color = if (selected) MaterialTheme.colorScheme.onPrimaryContainer else MaterialTheme.colorScheme.onSurface,
        )
        if (selected) {
            Spacer(Modifier.weight(1f))
            Text("✓", color = MaterialTheme.colorScheme.primary)
        }
    }
}
