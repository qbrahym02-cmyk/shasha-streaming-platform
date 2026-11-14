package com.shasha.app.data

import kotlinx.serialization.Serializable

// ===== المستخدم =====
@Serializable
data class User(
    val id: String = "",
    val email: String = "",
    val name: String = "",
    val avatarColor: String = "#00d26a",
    val isVip: Boolean = false,
    val vipUntil: String? = null,
)

// ===== التصنيفات =====
@Serializable
data class Genre(
    val slug: String = "",
    val nameAr: String = "",
    val nameEn: String = "",
)

// ===== العمل (فيلم/مسلسل) =====
@Serializable
data class Title(
    val id: String = "",
    val slug: String = "",
    val type: String = "MOVIE",
    val titleAr: String = "",
    val titleEn: String = "",
    val synopsisAr: String? = null,
    val synopsisEn: String? = null,
    val poster: String = "",
    val backdrop: String? = null,
    val year: Int? = null,
    val ageRating: String? = null,
    val score: Double? = null,
    val durationMin: Int? = null,
    val isPremium: Boolean = false,
    val releaseState: String = "released",
    val trending: Int? = null,
    val featured: Boolean? = null,
    val genres: List<Genre> = emptyList(),
    // تفاصيل فقط
    val episodes: List<Episode> = emptyList(),
    val similar: List<Title> = emptyList(),
    val canPlayVip: Boolean = false,
    // حالة المستخدم
    val inWatchlist: Boolean = false,
    val progressPct: Double = 0.0,
    val progressPositionSec: Double = 0.0,
    val progressDurationSec: Double = 0.0,
    val progressEpisodeId: String? = null,
)

@Serializable
data class Episode(
    val id: String = "",
    val season: Int = 1,
    val number: Int = 1,
    val nameAr: String = "",
    val nameEn: String = "",
    val durationMin: Int? = null,
    val isPremium: Boolean = false,
)

// ===== مصدر التشغيل =====
@Serializable
data class PlaySource(
    val sourceType: String? = null,
    val sourceUrl: String = "",
    val fallbackUrl: String? = null,
    val titleSlug: String = "",
    val titleAr: String = "",
    val titleEn: String = "",
    val episodeId: String? = null,
    val episodeNameAr: String? = null,
    val episodeNameEn: String? = null,
    val episodes: List<Episode> = emptyList(),
    val nextEpisodeId: String? = null,
    val resumeAt: Double = 0.0,
)

// ===== الباقات =====
@Serializable
data class Plan(
    val code: String = "",
    val nameAr: String = "",
    val nameEn: String = "",
    val priceDzd: Double = 0.0,
    val originalDzd: Double? = null,
    val months: Int = 1,
    val featuresAr: List<String> = emptyList(),
    val featuresEn: List<String> = emptyList(),
    val highlight: Boolean = false,
)

// ===== أغلفة الاستجابات =====
@Serializable
data class ApiError(
    val ok: Boolean = false,
    val error: String? = null,
    val code: String? = null,
)

@Serializable
data class TitlesResponse(
    val ok: Boolean = false,
    val data: List<Title> = emptyList(),
    val error: String? = null,
)

@Serializable
data class TitleResponse(
    val ok: Boolean = false,
    val data: Title? = null,
    val error: String? = null,
    val code: String? = null,
)

@Serializable
data class PlayResponse(
    val ok: Boolean = false,
    val data: PlaySource? = null,
    val error: String? = null,
    val code: String? = null,
)

@Serializable
data class GenresResponse(val ok: Boolean = false, val data: List<Genre> = emptyList())

@Serializable
data class PlansResponse(val ok: Boolean = false, val data: List<Plan> = emptyList())

@Serializable
data class MeResponse(val ok: Boolean = false, val user: User? = null)

@Serializable
data class UserBody(val user: User? = null)

@Serializable
data class UserResponse(val ok: Boolean = false, val data: UserBody? = null, val error: String? = null)

@Serializable
data class InWatchBody(val inWatchlist: Boolean = false)

@Serializable
data class WatchResponse(val ok: Boolean = false, val data: InWatchBody? = null)

@Serializable
data class ProgressEntry(
    val episodeId: String? = null,
    val positionSec: Double = 0.0,
    val durationSec: Double = 0.0,
)

@Serializable
data class ProgressBody(
    val list: List<Title> = emptyList(),
    val single: ProgressEntry? = null,
)

@Serializable
data class ProgressResponse(val ok: Boolean = false, val data: ProgressBody? = null)

@Serializable
data class SubscribeBody(val user: User? = null, val expiresAt: String? = null)

@Serializable
data class SubscribeResponse(val ok: Boolean = false, val data: SubscribeBody? = null, val error: String? = null)

// ===== أجسمة الطلبات =====
@Serializable
data class LoginRequest(val email: String, val password: String)

@Serializable
data class RegisterRequest(val email: String, val name: String, val password: String)

@Serializable
data class SlugRequest(val slug: String)

@Serializable
data class ProgressRequest(
    val slug: String,
    val episodeId: String? = null,
    val positionSec: Double = 0.0,
    val durationSec: Double = 0.0,
)

@Serializable
data class PlanRequest(val planCode: String)
