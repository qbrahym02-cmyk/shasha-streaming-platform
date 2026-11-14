package com.shasha.app.ui.theme

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Typography
import androidx.compose.material3.darkColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.Font
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.sp
import com.shasha.app.R

// ===== ألوان العلامة =====
val Emerald = Color(0xFF00D26A)
val EmeraldDark = Color(0xFF00A854)
val Gold = Color(0xFFE8B923)
val GoldDim = Color(0xFF8A7015)
val Bg = Color(0xFF070B09)
val Surface = Color(0xFF0E1611)
val SurfaceHigh = Color(0xFF15201A)
val SurfaceCard = Color(0xFF101A14)
val TextPrimary = Color(0xFFF2F7F4)
val TextSecondary = Color(0xFF9FB3A8)
val TextTertiary = Color(0xFF66796E)
val Outline = Color(0xFF24312A)
val Danger = Color(0xFFFF6B6B)

private val ShashaScheme = darkColorScheme(
    primary = Emerald,
    onPrimary = Color(0xFF04130B),
    primaryContainer = Color(0xFF00391E),
    onPrimaryContainer = Emerald,
    secondary = Gold,
    onSecondary = Color(0xFF191300),
    secondaryContainer = Color(0xFF4A3B0A),
    onSecondaryContainer = Gold,
    tertiary = Color(0xFF4ECDC4),
    background = Bg,
    onBackground = TextPrimary,
    surface = Surface,
    onSurface = TextPrimary,
    surfaceVariant = SurfaceHigh,
    onSurfaceVariant = TextSecondary,
    surfaceContainer = SurfaceCard,
    surfaceContainerHigh = SurfaceHigh,
    surfaceContainerHighest = SurfaceHigh,
    surfaceContainerLow = Surface,
    surfaceContainerLowest = Bg,
    outline = Outline,
    outlineVariant = Outline,
    error = Danger,
    onError = Color(0xFF2B0707),
)

// ===== خط Tajawal العربي =====
val Tajawal = FontFamily(
    Font(R.font.tajawal_regular, FontWeight.Normal),
    Font(R.font.tajawal_medium, FontWeight.Medium),
    Font(R.font.tajawal_bold, FontWeight.Bold),
)

private val ShashaTypography = Typography(
    displayLarge = TextStyle(fontFamily = Tajawal, fontWeight = FontWeight.Bold, fontSize = 34.sp),
    displayMedium = TextStyle(fontFamily = Tajawal, fontWeight = FontWeight.Bold, fontSize = 28.sp),
    headlineLarge = TextStyle(fontFamily = Tajawal, fontWeight = FontWeight.Bold, fontSize = 26.sp),
    headlineMedium = TextStyle(fontFamily = Tajawal, fontWeight = FontWeight.Bold, fontSize = 22.sp),
    headlineSmall = TextStyle(fontFamily = Tajawal, fontWeight = FontWeight.Bold, fontSize = 19.sp),
    titleLarge = TextStyle(fontFamily = Tajawal, fontWeight = FontWeight.Bold, fontSize = 17.sp),
    titleMedium = TextStyle(fontFamily = Tajawal, fontWeight = FontWeight.Medium, fontSize = 15.sp),
    titleSmall = TextStyle(fontFamily = Tajawal, fontWeight = FontWeight.Medium, fontSize = 13.sp),
    bodyLarge = TextStyle(fontFamily = Tajawal, fontWeight = FontWeight.Normal, fontSize = 15.sp),
    bodyMedium = TextStyle(fontFamily = Tajawal, fontWeight = FontWeight.Normal, fontSize = 13.sp),
    bodySmall = TextStyle(fontFamily = Tajawal, fontWeight = FontWeight.Normal, fontSize = 11.sp),
    labelLarge = TextStyle(fontFamily = Tajawal, fontWeight = FontWeight.Medium, fontSize = 14.sp),
    labelMedium = TextStyle(fontFamily = Tajawal, fontWeight = FontWeight.Medium, fontSize = 12.sp),
    labelSmall = TextStyle(fontFamily = Tajawal, fontWeight = FontWeight.Medium, fontSize = 10.sp),
)

@Composable
fun ShashaTheme(content: @Composable () -> Unit) {
    // الثيم داكن دائماً — هوية المنصة
    isSystemInDarkTheme()
    MaterialTheme(
        colorScheme = ShashaScheme,
        typography = ShashaTypography,
        content = content,
    )
}
