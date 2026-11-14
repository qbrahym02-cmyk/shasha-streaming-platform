package com.shasha.app.util

import android.content.Context
import androidx.appcompat.app.AppCompatDelegate
import androidx.core.os.LocaleListCompat
import java.util.Locale

// ============================================================
// اللغة — تبديل عربي/إنجليزي على مستوى التطبيق
// ============================================================

object Lang {
    private const val KEY = "app_lang"
    private lateinit var prefs: android.content.SharedPreferences

    fun init(context: Context) {
        prefs = context.getSharedPreferences("shasha_prefs", Context.MODE_PRIVATE)
        val tag = prefs.getString(KEY, "ar") ?: "ar"
        AppCompatDelegate.setApplicationLocales(LocaleListCompat.forLanguageTags(tag))
    }

    fun current(): String = prefs.getString(KEY, "ar") ?: "ar"

    fun apply(tag: String) {
        prefs.edit().putString(KEY, tag).apply()
        AppCompatDelegate.setApplicationLocales(LocaleListCompat.forLanguageTags(tag))
    }
}

// ============================================================
// أدوات مساعدة عامة
// ============================================================

fun fullImage(path: String?): String =
    when {
        path.isNullOrBlank() -> ""
        path.startsWith("http") -> path
        else -> com.shasha.app.data.Api.BASE + path
    }

fun fmtTime(ms: Long): String {
    val totalSec = (ms / 1000).coerceAtLeast(0)
    val h = totalSec / 3600
    val m = (totalSec % 3600) / 60
    val s = totalSec % 60
    return if (h > 0) String.format(Locale.US, "%d:%02d:%02d", h, m, s)
    else String.format(Locale.US, "%02d:%02d", m, s)
}

fun fmtDate(iso: String?): String {
    if (iso.isNullOrBlank()) return ""
    return try {
        val parsed = java.time.Instant.parse(iso)
        val dz = java.time.ZonedDateTime.ofInstant(parsed, java.time.ZoneId.systemDefault())
        String.format(Locale.US, "%04d/%02d/%02d", dz.year, dz.monthValue, dz.dayOfMonth)
    } catch (_: Exception) {
        iso.take(10)
    }
}
