@file:OptIn(androidx.compose.foundation.ExperimentalFoundationApi::class)

package com.shasha.app.ui.components

import androidx.compose.animation.core.LinearEasing
import androidx.compose.animation.core.RepeatMode
import androidx.compose.animation.core.animateFloat
import androidx.compose.animation.core.infiniteRepeatable
import androidx.compose.animation.core.rememberInfiniteTransition
import androidx.compose.animation.core.tween
import androidx.compose.foundation.background
import androidx.compose.foundation.basicMarquee
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.aspectRatio
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material.icons.filled.Warning
import androidx.compose.material3.Button
import androidx.compose.material3.Icon
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.composed
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalConfiguration
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.AsyncImage
import com.shasha.app.R
import com.shasha.app.data.Genre
import com.shasha.app.data.Title
import com.shasha.app.data.NET_CODE_NETWORK
import com.shasha.app.ui.icons.IconCrown
import com.shasha.app.ui.theme.Gold
import com.shasha.app.ui.theme.SurfaceCard
import com.shasha.app.ui.theme.SurfaceHigh
import com.shasha.app.ui.theme.TextSecondary
import com.shasha.app.ui.theme.TextTertiary
import com.shasha.app.util.fullImage

// هل الواجهة عربية الآن؟
@Composable
fun isArabic(): Boolean = LocalConfiguration.current.locale.language == "ar"

@Composable
fun Title.locName(): String = if (isArabic()) titleAr else titleEn

@Composable
fun Title.locSynopsis(): String =
    (if (isArabic()) synopsisAr else synopsisEn) ?: (if (isArabic()) synopsisEn ?: "" else synopsisAr ?: "")

@Composable
fun Genre.locName(): String = if (isArabic()) nameAr else nameEn

// ===== لمعة التحميل =====
fun Modifier.shimmer(): Modifier = composed {
    val transition = rememberInfiniteTransition(label = "shimmer")
    val alpha by transition.animateFloat(
        initialValue = 0.35f,
        targetValue = 0.9f,
        animationSpec = infiniteRepeatable(tween(900, easing = LinearEasing), RepeatMode.Reverse),
        label = "shimmerAlpha",
    )
    background(SurfaceHigh.copy(alpha = alpha))
}

@Composable
fun ShimmerPoster(modifier: Modifier = Modifier) {
    Column(modifier = modifier) {
        Box(
            Modifier
                .fillMaxWidth()
                .aspectRatio(2f / 3f)
                .clip(RoundedCornerShape(12.dp))
                .shimmer()
        )
        Spacer(Modifier.height(6.dp))
        Box(
            Modifier
                .fillMaxWidth(0.7f)
                .height(12.dp)
                .clip(RoundedCornerShape(4.dp))
                .shimmer()
        )
    }
}

// ===== صورة عن بعد =====
@Composable
fun NetImage(
    url: String?,
    contentDescription: String?,
    modifier: Modifier = Modifier,
    contentScale: ContentScale = ContentScale.Crop,
) {
    val full = fullImage(url)
    Box(modifier.clip(RoundedCornerShape(0.dp))) {
        if (full.isNotBlank()) {
            AsyncImage(
                model = full,
                contentDescription = contentDescription,
                contentScale = contentScale,
                modifier = Modifier.fillMaxSize(),
            )
        } else {
            Box(Modifier.fillMaxSize().background(SurfaceCard), contentAlignment = Alignment.Center) {
                Text("شاشة", color = TextTertiary, fontSize = 13.sp)
            }
        }
    }
}

// ===== شارة VIP =====
@Composable
fun VipChip(modifier: Modifier = Modifier, small: Boolean = false) {
    Row(
        modifier
            .clip(RoundedCornerShape(6.dp))
            .background(Gold.copy(alpha = 0.18f))
            .padding(horizontal = if (small) 5.dp else 8.dp, vertical = 2.dp),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(3.dp),
    ) {
        Icon(
            IconCrown,
            contentDescription = stringResource(R.string.vip_badge),
            tint = Gold,
            modifier = Modifier.size(if (small) 10.dp else 13.dp),
        )
        Text(
            stringResource(R.string.vip_badge),
            color = Gold,
            fontSize = if (small) 9.sp else 11.sp,
            style = MaterialTheme.typography.labelMedium,
        )
    }
}

// ===== بطاقة ملصق =====
@Composable
fun PosterCard(
    title: Title,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
    width: androidx.compose.ui.unit.Dp? = 128.dp,
) {
    val sized = if (width != null) modifier.width(width) else modifier
    Column(
        sized
            .clip(RoundedCornerShape(12.dp))
            .clickable(onClick = onClick)
            .padding(4.dp)
    ) {
        Box(
            Modifier
                .fillMaxWidth()
                .aspectRatio(2f / 3f)
                .clip(RoundedCornerShape(12.dp))
        ) {
            NetImage(title.poster, title.locName(), Modifier.fillMaxSize())
            if (title.isPremium) {
                VipChip(
                    Modifier
                        .align(Alignment.TopStart)
                        .padding(6.dp), small = true
                )
            }
            if (title.progressPct > 0) {
                LinearProgressIndicator(
                    progress = { (title.progressPct / 100.0).toFloat().coerceIn(0f, 1f) },
                    modifier = Modifier
                        .align(Alignment.BottomCenter)
                        .fillMaxWidth()
                        .height(3.dp),
                    color = MaterialTheme.colorScheme.primary,
                    trackColor = Color.Black.copy(alpha = 0.5f),
                )
            }
            if (title.releaseState == "coming_soon") {
                Box(
                    Modifier
                        .align(Alignment.Center)
                        .clip(RoundedCornerShape(8.dp))
                        .background(Color.Black.copy(alpha = 0.65f))
                        .padding(horizontal = 10.dp, vertical = 4.dp)
                ) {
                    Text(
                        stringResource(R.string.coming_soon),
                        color = Color.White,
                        fontSize = 11.sp,
                        style = MaterialTheme.typography.labelMedium,
                    )
                }
            }
        }
        Spacer(Modifier.height(7.dp))
        Text(
            title.locName(),
            style = MaterialTheme.typography.titleSmall,
            maxLines = 1,
            overflow = TextOverflow.Ellipsis,
            modifier = Modifier.basicMarquee(),
        )
        Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(6.dp)) {
            title.score?.let {
                Text("★ ${it}", color = Gold, fontSize = 11.sp, style = MaterialTheme.typography.labelMedium)
            }
            title.year?.let {
                Text("• $it", color = TextSecondary, fontSize = 11.sp, style = MaterialTheme.typography.labelMedium)
            }
        }
    }
}

// ===== بطاقة عريضة (تابع المشاهدة) =====
@Composable
fun WideCard(title: Title, onClick: () -> Unit, modifier: Modifier = Modifier) {
    Column(
        modifier
            .width(232.dp)
            .clip(RoundedCornerShape(14.dp))
            .clickable(onClick = onClick)
            .padding(4.dp)
    ) {
        Box(
            Modifier
                .fillMaxWidth()
                .aspectRatio(16f / 9f)
                .clip(RoundedCornerShape(14.dp))
        ) {
            NetImage(title.backdrop ?: title.poster, title.locName(), Modifier.fillMaxSize())
            Box(
                Modifier
                    .fillMaxSize()
                    .background(
                        Brush.verticalGradient(
                            0f to Color.Transparent,
                            1f to Color.Black.copy(alpha = 0.75f),
                        )
                    )
            )
            Text(
                title.locName(),
                color = Color.White,
                style = MaterialTheme.typography.titleSmall,
                maxLines = 1,
                overflow = TextOverflow.Ellipsis,
                modifier = Modifier
                    .align(Alignment.BottomStart)
                    .padding(start = 10.dp, end = 10.dp, bottom = 22.dp),
            )
            if (title.progressPct > 0) {
                LinearProgressIndicator(
                    progress = { (title.progressPct / 100.0).toFloat().coerceIn(0f, 1f) },
                    modifier = Modifier
                        .align(Alignment.BottomCenter)
                        .fillMaxWidth()
                        .height(3.dp),
                    color = MaterialTheme.colorScheme.primary,
                    trackColor = Color.White.copy(alpha = 0.25f),
                )
            }
        }
    }
}

// ===== رأس قسم =====
@Composable
fun SectionHeader(text: String, onMore: (() -> Unit)? = null) {
    Row(
        Modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp, vertical = 10.dp),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        Text(text, style = MaterialTheme.typography.titleLarge, modifier = Modifier.weight(1f))
        if (onMore != null) {
            Text(
                stringResource(R.string.all),
                color = MaterialTheme.colorScheme.primary,
                style = MaterialTheme.typography.titleMedium,
                modifier = Modifier
                    .clip(RoundedCornerShape(8.dp))
                    .clickable(onClick = onMore)
                    .padding(horizontal = 8.dp, vertical = 4.dp),
            )
        }
    }
}

// ===== حالة خطأ =====
@Composable
fun ErrorBox(message: String, isNetwork: Boolean, onRetry: () -> Unit, modifier: Modifier = Modifier) {
    Column(
        modifier
            .fillMaxWidth()
            .padding(28.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.spacedBy(12.dp),
    ) {
        Icon(Icons.Default.Warning, contentDescription = null, tint = TextSecondary, modifier = Modifier.size(38.dp))
        Text(
            if (isNetwork) stringResource(R.string.error_network) else message.ifBlank { stringResource(R.string.error_generic) },
            color = TextSecondary,
            style = MaterialTheme.typography.bodyLarge,
        )
        Button(onClick = onRetry) {
            Icon(Icons.Default.Refresh, contentDescription = null, modifier = Modifier.size(17.dp))
            Spacer(Modifier.width(6.dp))
            Text(stringResource(R.string.retry))
        }
    }
}

// ===== حالة فراغ =====
@Composable
fun EmptyBox(text: String, modifier: Modifier = Modifier) {
    Column(
        modifier
            .fillMaxWidth()
            .padding(vertical = 44.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.spacedBy(8.dp),
    ) {
        Box(
            Modifier
                .size(52.dp)
                .clip(CircleShape)
                .background(SurfaceHigh),
            contentAlignment = Alignment.Center,
        ) {
            Text("شاشة", color = TextTertiary, fontSize = 12.sp)
        }
        Text(text, color = TextSecondary, style = MaterialTheme.typography.bodyMedium)
    }
}

@Composable
fun netErrorText(err: com.shasha.app.data.Net.Err): String =
    if (err.code == NET_CODE_NETWORK) stringResource(R.string.error_network)
    else err.message.ifBlank { stringResource(R.string.error_generic) }
