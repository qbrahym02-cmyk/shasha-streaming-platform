package com.shasha.app.ui.screens

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.foundation.ExperimentalFoundationApi
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
import androidx.compose.foundation.layout.statusBarsPadding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.pager.HorizontalPager
import androidx.compose.foundation.pager.rememberPagerState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.Info
import androidx.compose.material.icons.filled.PlayArrow
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.produceState
import androidx.compose.runtime.remember
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
import com.shasha.app.data.Title
import com.shasha.app.goDetails
import com.shasha.app.goWatch
import com.shasha.app.ui.components.ErrorBox
import com.shasha.app.ui.components.NetImage
import com.shasha.app.ui.components.PosterCard
import com.shasha.app.ui.components.SectionHeader
import com.shasha.app.ui.components.ShimmerPoster
import com.shasha.app.ui.components.VipChip
import com.shasha.app.ui.components.WideCard
import com.shasha.app.ui.components.isArabic
import com.shasha.app.ui.components.locName
import com.shasha.app.ui.components.locSynopsis
import com.shasha.app.ui.theme.Bg
import com.shasha.app.ui.theme.TextSecondary
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch

// ===== بيانات الشاشة الرئيسية =====
data class HomeData(
    val hero: List<Title> = emptyList(),
    val continueList: List<Title> = emptyList(),
    val trending: List<Title> = emptyList(),
    val newest: List<Title> = emptyList(),
    val vip: List<Title> = emptyList(),
    val movies: List<Title> = emptyList(),
    val series: List<Title> = emptyList(),
)

@OptIn(ExperimentalFoundationApi::class)
@Composable
fun HomeScreen(nav: NavHostController) {
    var tick by remember { mutableStateOf(0) }
    val state by produceState(initialValue = UiState.loading<HomeData>(), key1 = tick) {
        value = load()
    }

    when {
        state.loading -> LoadingHome()
        state.error != null -> Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
            ErrorBox(message = state.error ?: "", isNetwork = state.networkError, onRetry = { tick++ })
        }
        else -> HomeContent(nav, state.data ?: HomeData())
    }
}

// حالة بسيطة للتحميل
data class UiState<T>(
    val loading: Boolean = false,
    val data: T? = null,
    val error: String? = null,
    val networkError: Boolean = false,
) {
    companion object {
        fun <T> loading() = UiState<T>(loading = true)
    }
}

private suspend fun load(): UiState<HomeData> {
    val hero = Repo.titles(section = "featured", limit = 6)
    val trending = Repo.titles(section = "trending", limit = 14)
    val newest = Repo.titles(sort = "newest", limit = 14)
    val vip = Repo.titles(section = "vip", limit = 14)
    val movies = Repo.titles(type = "MOVIE", limit = 14)
    val series = Repo.titles(type = "SERIES", limit = 14)
    val cont = Repo.continueWatching()

    val heroList = (hero as? Net.Ok)?.value ?: emptyList()
    if (heroList.isEmpty()) {
        val err = hero as? Net.Err
        return UiState(error = err?.message ?: "", networkError = err?.code == com.shasha.app.data.NET_CODE_NETWORK)
    }
    return UiState(
        data = HomeData(
            hero = heroList,
            continueList = (cont as? Net.Ok)?.value ?: emptyList(),
            trending = (trending as? Net.Ok)?.value ?: emptyList(),
            newest = (newest as? Net.Ok)?.value ?: emptyList(),
            vip = (vip as? Net.Ok)?.value ?: emptyList(),
            movies = (movies as? Net.Ok)?.value ?: emptyList(),
            series = (series as? Net.Ok)?.value ?: emptyList(),
        )
    )
}

@Composable
private fun LoadingHome() {
    LazyColumn(Modifier.fillMaxSize().statusBarsPadding()) {
        item {
            Box(
                Modifier
                    .fillMaxWidth()
                    .height(430.dp)
                    .padding(16.dp)
                    .clip(RoundedCornerShape(20.dp))
                    .background(MaterialTheme.colorScheme.surfaceContainerHigh)
            )
        }
        item {
            Row(
                Modifier
                    .fillMaxWidth()
                    .padding(16.dp),
                horizontalArrangement = Arrangement.spacedBy(10.dp),
            ) {
                repeat(3) { ShimmerPoster(Modifier.weight(1f)) }
            }
        }
        item {
            Row(
                Modifier
                    .fillMaxWidth()
                    .padding(16.dp),
                horizontalArrangement = Arrangement.spacedBy(10.dp),
            ) {
                repeat(3) { ShimmerPoster(Modifier.weight(1f)) }
            }
        }
    }
}

@OptIn(ExperimentalFoundationApi::class)
@Composable
private fun HomeContent(nav: NavHostController, data: HomeData) {
    LazyColumn(Modifier.fillMaxSize()) {
        // ===== البانر =====
        item { HeroBanner(nav, data.hero) }

        // ===== تابع المشاهدة =====
        if (data.continueList.isNotEmpty()) {
            item { SectionHeader(stringResource(R.string.continue_watching)) }
            item {
                LazyRow(
                    contentPadding = androidx.compose.foundation.layout.PaddingValues(horizontal = 12.dp),
                    horizontalArrangement = Arrangement.spacedBy(10.dp),
                ) {
                    items(data.continueList, key = { "c" + it.id }) { t ->
                        WideCard(t, onClick = { nav.goWatch(t.slug, t.progressEpisodeId) })
                    }
                }
            }
        }

        // ===== رواج =====
        item { SectionHeader(stringResource(R.string.trending), onMore = { nav.navigate("browse") }) }
        item { TitleRow(nav, data.trending) }

        // ===== VIP =====
        if (data.vip.isNotEmpty()) {
            item { SectionHeader(stringResource(R.string.vip_section), onMore = { nav.navigate("browse?genre=&type=") }) }
            item { TitleRow(nav, data.vip) }
        }

        // ===== أفلام =====
        item { SectionHeader(stringResource(R.string.movies), onMore = { nav.navigate("browse?type=MOVIE") }) }
        item { TitleRow(nav, data.movies) }

        // ===== مسلسلات =====
        item { SectionHeader(stringResource(R.string.series), onMore = { nav.navigate("browse?type=SERIES") }) }
        item { TitleRow(nav, data.series) }

        // ===== الأحدث =====
        item { SectionHeader(stringResource(R.string.newest)) }
        item { TitleRow(nav, data.newest) }

        item { Spacer(Modifier.height(24.dp)) }
    }
}

@Composable
private fun TitleRow(nav: NavHostController, list: List<Title>) {
    LazyRow(
        contentPadding = androidx.compose.foundation.layout.PaddingValues(horizontal = 12.dp),
        horizontalArrangement = Arrangement.spacedBy(10.dp),
    ) {
        items(list, key = { it.id }) { t ->
            PosterCard(t, onClick = { nav.goDetails(t.slug) })
        }
    }
}

// ============================================================
// البانر الرئيسي المتحرك
// ============================================================
@OptIn(ExperimentalFoundationApi::class)
@Composable
private fun HeroBanner(nav: NavHostController, heroes: List<Title>) {
    if (heroes.isEmpty()) return
    val pagerState = rememberPagerState(pageCount = { heroes.size })

    // تقدّم تلقائي
    LaunchedEffect(pagerState.pageCount) {
        while (pagerState.pageCount > 1) {
            delay(6500)
            val next = (pagerState.currentPage + 1) % pagerState.pageCount
            pagerState.animateScrollToPage(next)
        }
    }

    Box(Modifier.fillMaxWidth().height(500.dp)) {
        HorizontalPager(state = pagerState, modifier = Modifier.fillMaxSize()) { page ->
            val t = heroes[page]
            Box(Modifier.fillMaxSize()) {
                NetImage(t.backdrop ?: t.poster, t.locName(), Modifier.fillMaxSize())
                // تدرّجات فوق الصورة
                Box(
                    Modifier
                        .fillMaxSize()
                        .background(
                            Brush.verticalGradient(
                                0f to Color.Black.copy(alpha = 0.25f),
                                0.45f to Color.Transparent,
                                1f to Bg,
                            )
                        )
                )
            }
        }

        // بطاقة معلومات العمل الحالي
        val current = heroes[pagerState.currentPage]
        Column(
            Modifier
                .align(Alignment.BottomCenter)
                .fillMaxWidth()
                .padding(horizontal = 20.dp, vertical = 28.dp),
        ) {
            AnimatedVisibility(visible = true, enter = fadeIn(), exit = fadeOut()) {
                Column {
                    Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        if (current.isPremium) VipChip()
                        Text(
                            if (current.type == "MOVIE") stringResource(R.string.movies) else stringResource(R.string.series),
                            color = Color.White.copy(alpha = 0.85f),
                            style = MaterialTheme.typography.titleSmall,
                        )
                    }
                    Spacer(Modifier.height(8.dp))
                    Text(
                        current.locName(),
                        color = Color.White,
                        style = MaterialTheme.typography.displayMedium,
                        maxLines = 2,
                        overflow = TextOverflow.Ellipsis,
                    )
                    Spacer(Modifier.height(6.dp))
                    Text(
                        current.locSynopsis(),
                        color = Color.White.copy(alpha = 0.75f),
                        style = MaterialTheme.typography.bodyMedium,
                        maxLines = 2,
                        overflow = TextOverflow.Ellipsis,
                    )
                    Spacer(Modifier.height(14.dp))
                    Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                        Button(
                            onClick = {
                                if (current.releaseState == "coming_soon") {
                                    nav.goDetails(current.slug)
                                } else {
                                    nav.goWatch(current.slug, null)
                                }
                            },
                            colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.primary),
                            shape = RoundedCornerShape(12.dp),
                        ) {
                            Icon(Icons.Default.PlayArrow, contentDescription = null, modifier = Modifier.size(20.dp))
                            Spacer(Modifier.width(6.dp))
                            Text(
                                if (current.releaseState == "coming_soon") stringResource(R.string.coming_soon)
                                else stringResource(R.string.watch_now),
                                color = MaterialTheme.colorScheme.onPrimary,
                            )
                        }
                        OutlinedButton(
                            onClick = { nav.goDetails(current.slug) },
                            shape = RoundedCornerShape(12.dp),
                        ) {
                            Icon(Icons.Default.Info, contentDescription = null, modifier = Modifier.size(17.dp), tint = Color.White)
                            Spacer(Modifier.width(6.dp))
                            Text(stringResource(R.string.details), color = Color.White)
                        }
                    }
                }
            }
        }

        // نقاط المؤشر
        Row(
            Modifier
                .align(Alignment.BottomCenter)
                .padding(bottom = 12.dp),
            horizontalArrangement = Arrangement.spacedBy(5.dp),
        ) {
            repeat(heroes.size) { i ->
                Box(
                    Modifier
                        .size(if (pagerState.currentPage == i) 16.dp else 6.dp, 6.dp)
                        .clip(RoundedCornerShape(3.dp))
                        .background(
                            if (pagerState.currentPage == i) MaterialTheme.colorScheme.primary
                            else Color.White.copy(alpha = 0.35f)
                        )
                )
            }
        }
    }
}
