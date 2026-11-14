package com.shasha.app.data

import android.content.Context
import android.content.SharedPreferences
import com.shasha.app.BuildConfig
import kotlinx.serialization.json.Json
import okhttp3.Interceptor
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import retrofit2.HttpException
import retrofit2.Retrofit
import retrofit2.converter.kotlinx.serialization.asConverterFactory
import retrofit2.http.Body
import retrofit2.http.DELETE
import retrofit2.http.GET
import retrofit2.http.POST
import retrofit2.http.Path
import retrofit2.http.Query
import java.util.concurrent.TimeUnit

// ============================================================
// طبقة الشبكة — Retrofit + OkHttp مع حفظ كوكيز الجلسة الموقّعة
// ============================================================

interface ShashaService {
    @GET("api/titles")
    suspend fun titles(
        @Query("type") type: String? = null,
        @Query("genre") genre: String? = null,
        @Query("q") q: String? = null,
        @Query("section") section: String? = null,
        @Query("sort") sort: String? = null,
        @Query("limit") limit: Int = 24,
    ): TitlesResponse

    @GET("api/titles/{slug}")
    suspend fun detail(@Path("slug") slug: String): TitleResponse

    @GET("api/titles/{slug}/play")
    suspend fun play(@Path("slug") slug: String, @Query("e") episodeId: String? = null): PlayResponse

    @GET("api/genres")
    suspend fun genres(): GenresResponse

    @GET("api/plans")
    suspend fun plans(): PlansResponse

    @GET("api/auth/me")
    suspend fun me(): MeResponse

    @POST("api/auth/login")
    suspend fun login(@Body body: LoginRequest): UserResponse

    @POST("api/auth/register")
    suspend fun register(@Body body: RegisterRequest): UserResponse

    @POST("api/auth/logout")
    suspend fun logout(): UserResponse

    @GET("api/watchlist")
    suspend fun watchlist(): TitlesResponse

    @POST("api/watchlist")
    suspend fun addWatchlist(@Body body: SlugRequest): WatchResponse

    @DELETE("api/watchlist")
    suspend fun removeWatchlist(@Query("slug") slug: String): WatchResponse

    @GET("api/progress")
    suspend fun progressList(): ProgressResponse

    @POST("api/progress")
    suspend fun saveProgress(@Body body: ProgressRequest): ProgressResponse

    @POST("api/subscribe")
    suspend fun subscribe(@Body body: PlanRequest): SubscribeResponse

    @DELETE("api/subscribe")
    suspend fun cancelSubscribe(): SubscribeResponse
}

object Api {
    const val BASE: String = BuildConfig.API_BASE

    val json: Json = Json {
        ignoreUnknownKeys = true
        coerceInputValues = true
        encodeDefaults = true
    }

    lateinit var service: ShashaService
        private set

    private lateinit var prefs: SharedPreferences

    fun init(context: Context) {
        prefs = context.getSharedPreferences("shasha_net", Context.MODE_PRIVATE)

        // إرفاق كوكيز الجلسة مع كل طلب وحفظ المستلمة من الاستجابات
        val cookieInterceptor = Interceptor { chain ->
            val stored = prefs.getString("cookies", "") ?: ""
            val request = if (stored.isNotBlank()) {
                chain.request().newBuilder().header("Cookie", stored).build()
            } else {
                chain.request()
            }
            val response = chain.proceed(request)
            val setCookies = response.headers("Set-Cookie")
            if (setCookies.isNotEmpty()) {
                val map = parseCookies(stored).toMutableMap()
                for (raw in setCookies) {
                    val pair = raw.substringBefore(';').trim()
                    if (pair.isEmpty()) continue
                    val name = pair.substringBefore('=').trim()
                    val value = pair.substringAfter('=', "").trim()
                    val maxAge = Regex("Max-Age=(\\d+)").find(raw)?.groupValues?.get(1)?.toLongOrNull()
                    if (maxAge == 0L || value.isBlank()) map.remove(name) else map[name] = value
                }
                prefs.edit().putString("cookies", map.entries.joinToString("; ") { "${it.key}=${it.value}" }).apply()
            }
            response
        }

        val client = OkHttpClient.Builder()
            .addInterceptor(cookieInterceptor)
            .connectTimeout(20, TimeUnit.SECONDS)
            .readTimeout(30, TimeUnit.SECONDS)
            .writeTimeout(30, TimeUnit.SECONDS)
            .build()

        service = Retrofit.Builder()
            .baseUrl("$BASE/")
            .client(client)
            .addConverterFactory(json.asConverterFactory("application/json".toMediaType()))
            .build()
            .create(ShashaService::class.java)
    }

    fun clearCookies() {
        prefs.edit().remove("cookies").apply()
    }

    private fun parseCookies(header: String): Map<String, String> =
        header.split("; ").filter { it.contains('=') }.associate {
            it.substringBefore('=') to it.substringAfter('=')
        }
}

// ===== نتيجة موحدة للشبكة =====
sealed class Net<out T> {
    data class Ok<T>(val value: T) : Net<T>()
    data class Err(val message: String, val code: String? = null) : Net<Nothing>()
}

const val NET_CODE_NETWORK = "network"

suspend fun <T> net(block: suspend () -> T): Net<T> = try {
    Net.Ok(block())
} catch (e: HttpException) {
    val raw = try { e.response()?.errorBody()?.string() } catch (_: Exception) { null }
    val parsed = raw?.let { runCatching { Api.json.decodeFromString<ApiError>(it) }.getOrNull() }
    Net.Err(parsed?.error ?: "HTTP ${e.code()}", parsed?.code)
} catch (e: Exception) {
    Net.Err("network", NET_CODE_NETWORK)
}
