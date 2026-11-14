package com.shasha.app.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.aspectRatio
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.navigationBarsPadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.Lock
import androidx.compose.material.icons.filled.PlayArrow
import androidx.compose.material.icons.filled.Star
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.SnackbarHost
import androidx.compose.material3.SnackbarHostState
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.produceState
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.navigation.NavHostController
import com.shasha.app.R
import com.shasha.app.data.Net
import com.shasha.app.data.Repo
import com.shasha.app.data.Session
import com.shasha.app.data.Title
import com.shasha.app.goDetails
import com.shasha.app.goWatch
import com.shasha.app.ui.components.ErrorBox
import com.shasha.app.ui.components.NetImage
import com.shasha.app.ui.components.PosterCard
import com.shasha.app.ui.components.SectionHeader
import com.shasha.app.ui.components.VipChip
import com.shasha.app.ui.components.isArabic
import com.shasha.app.ui.components.locName
import com.shasha.app.ui.components.locSynopsis
import com.shasha.app.ui.theme.Gold
import com.shasha.app.ui.theme.TextSecondary
import kotlinx.coroutines.launch

@Composable
fun DetailsScreen(nav: NavHostController, slug: String) {
    var tick by remember { mutableStateOf(0) }
    val user by Session.user.collectAsState()
    val scope = rememberCoroutineScope()
    val snackbar = remember { SnackbarHostState() }

    val state by produceState(
        initialValue = UiState.loading<Title>(),
        key1 = slug,
        key2 = tick,
        key3 = user?.id,
    ) {
        value = when (val r = Repo.detail(slug)) {
            is Net.Ok -> UiState(data = r.value)
            is Net.Err -> UiState(error = r.message, networkError = r.code == com.shasha.app.data.NET_CODE_NETWORK)
        }
    }

    var inWatchlist by remember { mutableStateOf(false) }
    LaunchedEffect(state.data) { inWatchlist = state.data?.inWatchlist ?: false }

    Box(Modifier.fillMaxSize()) {
        when {
            state.loading -> Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                CircularProgressIndicator(color = MaterialTheme.colorScheme.primary)
            }
            state.error != null -> Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                ErrorBox(state.error ?: "", state.networkError, { tick++ })
            }
            else -> {
                val t = state.data ?: return@Box
                DetailsContent(
                    nav = nav,
                    t = t,
                    inWatchlist = inWatchlist,
                    onToggleWatchlist = {
                        if (user == null) {
                            nav.navigate("auth")
                        } else {
                            val target = !inWatchlist
                            inWatchlist = target
                            scope.launch {
                                val r = if (target) Repo.addWatchlist(slug) else Repo.removeWatchlist(slug)
                                if (r is Net.Err) inWatchlist = !target
                            }
                        }
                    },
                    onPlay = { episodeId ->
                        when {
                            t.releaseState == "coming_soon" -> Unit
                            t.isPremium && user?.isVip != true -> nav.navigate("vip")
                            else -> nav.goWatch(slug, episodeId)
                        }
                    },
                )
            }
        }
        SnackbarHost(snackbar, Modifier.align(Alignment.BottomCenter))
    }
}

@Composable
private fun DetailsContent(
    nav: NavHostController,
    t: Title,
    inWatchlist: Boolean,
    onToggleWatchlist: () -> Unit,
    onPlay: (String?) -> Unit,
) {
    LazyColumn(Modifier.fillMaxSize()) {
        // ===== الرأس =====
        item {
            Box(Modifier.fillMaxWidth().height(300.dp)) {
                NetImage(t.backdrop ?: t.poster, t.locName(), Modifier.fillMaxSize())
                Box(
                    Modifier
                        .fillMaxSize()
                        .background(
                            Brush.verticalGradient(
                                0f to Color.Black.copy(alpha = 0.3f),
                                0.5f to Color.Transparent,
                                1f to MaterialTheme.colorScheme.background,
                            )
                        )
                )
                IconButton(
                    onClick = { nav.popBackStack() },
                    modifier = Modifier
                        .align(Alignment.TopStart)
                        .padding(6.dp)
                        .clip(CircleShape)
                        .background(Color.Black.copy(alpha = 0.45f)),
                ) {
                    Icon(
                        Icons.AutoMirrored.Filled.ArrowBack,
                        contentDescription = null,
                        tint = Color.White,
                    )
                }
            }
        }

        // ===== الملصق والعنوان =====
        item {
            Row(
                Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp),
                verticalAlignment = Alignment.Top,
            ) {
                NetImage(
                    t.poster,
                    t.locName(),
                    Modifier
                        .width(108.dp)
                        .aspectRatio(2f / 3f)
                        .clip(RoundedCornerShape(14.dp)),
                )
                Column(Modifier.padding(start = 14.dp, top = 4.dp)) {
                    Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        if (t.isPremium) VipChip()
                        if (t.releaseState == "coming_soon") {
                            Text(
                                stringResource(R.string.coming_soon),
                                color = MaterialTheme.colorScheme.primary,
                                style = MaterialTheme.typography.titleSmall,
                            )
                        }
                    }
                    Spacer(Modifier.height(6.dp))
                    Text(
                        t.locName(),
                        style = MaterialTheme.typography.headlineMedium,
                        maxLines = 3,
                        overflow = TextOverflow.Ellipsis,
                    )
                    Spacer(Modifier.height(8.dp))
                    Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                        t.score?.let {
                            Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(3.dp)) {
                                Icon(Icons.Default.Star, contentDescription = null, tint = Gold, modifier = Modifier.size(15.dp))
                                Text("${it}", color = Gold, style = MaterialTheme.typography.titleMedium)
                            }
                        }
                        t.year?.let { Text("$it", color = TextSecondary, style = MaterialTheme.typography.titleMedium) }
                        t.ageRating?.let {
                            Text(
                                it,
                                color = TextSecondary,
                                style = MaterialTheme.typography.titleMedium,
                                modifier = Modifier
                                    .clip(RoundedCornerShape(4.dp))
                                    .background(MaterialTheme.colorScheme.surfaceContainerHigh)
                                    .padding(horizontal = 6.dp, vertical = 2.dp),
                            )
                        }
                        t.durationMin?.let {
                            Text("• $it ${stringResource(R.string.minutes)}", color = TextSecondary, style = MaterialTheme.typography.titleMedium)
                        }
                    }
                }
            }
        }

        // ===== أزرار التشغيل =====
        item {
            Row(
                Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp, vertical = 16.dp),
                horizontalArrangement = Arrangement.spacedBy(10.dp),
            ) {
                Button(
                    onClick = { onPlay(null) },
                    modifier = Modifier.weight(1f).height(52.dp),
                    shape = RoundedCornerShape(14.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.primary),
                ) {
                    Icon(Icons.Default.PlayArrow, contentDescription = null, modifier = Modifier.size(22.dp))
                    Spacer(Modifier.width(6.dp))
                    Text(
                        if (t.releaseState == "coming_soon") stringResource(R.string.coming_soon)
                        else stringResource(R.string.watch_now),
                        color = MaterialTheme.colorScheme.onPrimary,
                    )
                }
                OutlinedButton(
                    onClick = onToggleWatchlist,
                    modifier = Modifier.height(52.dp),
                    shape = RoundedCornerShape(14.dp),
                ) {
                    Icon(
                        if (inWatchlist) Icons.Default.Check else Icons.Default.Add,
                        contentDescription = null,
                        tint = if (inWatchlist) MaterialTheme.colorScheme.primary else Color.White,
                    )
                    Spacer(Modifier.width(6.dp))
                    Text(
                        if (inWatchlist) stringResource(R.string.in_list) else stringResource(R.string.add_to_list),
                        color = Color.White,
                    )
                }
            }
        }

        // ===== التصنيفات =====
        if (t.genres.isNotEmpty()) {
            item {
                Row(
                    Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 16.dp),
                    horizontalArrangement = Arrangement.spacedBy(8.dp),
                ) {
                    t.genres.take(4).forEach { g ->
                        Text(
                            if (isArabic()) g.nameAr else g.nameEn,
                            style = MaterialTheme.typography.labelMedium,
                            color = TextSecondary,
                            modifier = Modifier
                                .clip(RoundedCornerShape(50))
                                .background(MaterialTheme.colorScheme.surfaceContainerHigh)
                                .padding(horizontal = 12.dp, vertical = 6.dp),
                        )
                    }
                }
            }
        }

        // ===== القصة =====
        item {
            Column(Modifier.padding(horizontal = 16.dp, vertical = 14.dp)) {
                Text(stringResource(R.string.synopsis), style = MaterialTheme.typography.titleLarge)
                Spacer(Modifier.height(8.dp))
                Text(
                    t.locSynopsis(),
                    style = MaterialTheme.typography.bodyMedium,
                    color = TextSecondary,
                )
            }
        }

        // ===== الحلقات =====
        if (t.type == "SERIES" && t.episodes.isNotEmpty()) {
            item { SectionHeader(stringResource(R.string.episodes)) }
            items(t.episodes, key = { it.id }) { ep ->
                Row(
                    Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 16.dp, vertical = 6.dp)
                        .clip(RoundedCornerShape(12.dp))
                        .background(MaterialTheme.colorScheme.surfaceContainer)
                        .padding(12.dp),
                    verticalAlignment = Alignment.CenterVertically,
                ) {
                    Box(
                        Modifier
                            .size(40.dp)
                            .clip(CircleShape)
                            .background(MaterialTheme.colorScheme.surfaceContainerHigh),
                        contentAlignment = Alignment.Center,
                    ) {
                        Text("${ep.number}", color = MaterialTheme.colorScheme.primary, style = MaterialTheme.typography.titleMedium)
                    }
                    Column(
                        Modifier
                            .weight(1f)
                            .padding(horizontal = 12.dp)
                    ) {
                        Text(
                            if (isArabic()) ep.nameAr else ep.nameEn,
                            style = MaterialTheme.typography.titleMedium,
                            maxLines = 1,
                            overflow = TextOverflow.Ellipsis,
                        )
                        Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                            Text(
                                stringResource(R.string.episode, ep.number),
                                color = TextSecondary,
                                style = MaterialTheme.typography.labelMedium,
                            )
                            ep.durationMin?.let {
                                Text("• $it ${stringResource(R.string.minutes)}", color = TextSecondary, style = MaterialTheme.typography.labelMedium)
                            }
                        }
                    }
                    if (ep.isPremium) {
                        Icon(Icons.Default.Lock, contentDescription = null, tint = Gold, modifier = Modifier.size(17.dp))
                    }
                    IconButton(onClick = { onPlay(ep.id) }) {
                        Icon(
                            Icons.Default.PlayArrow,
                            contentDescription = null,
                            tint = MaterialTheme.colorScheme.primary,
                        )
                    }
                }
            }
        }

        // ===== مشابه =====
        if (t.similar.isNotEmpty()) {
            item { SectionHeader(stringResource(R.string.similar)) }
            item {
                LazyRow(
                    contentPadding = androidx.compose.foundation.layout.PaddingValues(horizontal = 12.dp),
                    horizontalArrangement = Arrangement.spacedBy(10.dp),
                ) {
                    items(t.similar, key = { it.id }) { s ->
                        PosterCard(s, onClick = { nav.goDetails(s.slug) })
                    }
                }
            }
        }

        item { Spacer(Modifier.height(30.dp).navigationBarsPadding()) }
    }
}
