package com.shasha.app.data

import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

// ============================================================
// المستودع — كل نداءات الـ API في مكان واحد
// ============================================================

object Repo {
    suspend fun titles(
        type: String? = null,
        genre: String? = null,
        q: String? = null,
        section: String? = null,
        sort: String? = null,
        limit: Int = 24,
    ): Net<List<Title>> = withContext(Dispatchers.IO) {
        when (val r = net { Api.service.titles(type, genre, q, section, sort, limit) }) {
            is Net.Ok -> Net.Ok(r.value.data)
            is Net.Err -> r
        }
    }

    suspend fun detail(slug: String): Net<Title> = withContext(Dispatchers.IO) {
        when (val r = net { Api.service.detail(slug) }) {
            is Net.Ok -> Net.Ok(r.value.data ?: Title())
            is Net.Err -> r
        }
    }

    suspend fun play(slug: String, episodeId: String?): Net<PlaySource> = withContext(Dispatchers.IO) {
        when (val r = net { Api.service.play(slug, episodeId?.takeIf { it.isNotBlank() }) }) {
            is Net.Ok -> {
                val d = r.value.data
                if (d != null && d.sourceUrl.isNotBlank()) Net.Ok(d)
                else Net.Err(r.value.error ?: "no source", r.value.code ?: "no_source")
            }
            is Net.Err -> r
        }
    }

    suspend fun genres(): Net<List<Genre>> = withContext(Dispatchers.IO) {
        when (val r = net { Api.service.genres() }) {
            is Net.Ok -> Net.Ok(r.value.data)
            is Net.Err -> r
        }
    }

    suspend fun plans(): Net<List<Plan>> = withContext(Dispatchers.IO) {
        when (val r = net { Api.service.plans() }) {
            is Net.Ok -> Net.Ok(r.value.data)
            is Net.Err -> r
        }
    }

    suspend fun watchlist(): Net<List<Title>> = withContext(Dispatchers.IO) {
        when (val r = net { Api.service.watchlist() }) {
            is Net.Ok -> Net.Ok(r.value.data)
            is Net.Err -> r
        }
    }

    suspend fun addWatchlist(slug: String): Net<Boolean> = withContext(Dispatchers.IO) {
        when (val r = net { Api.service.addWatchlist(SlugRequest(slug)) }) {
            is Net.Ok -> Net.Ok(r.value.data?.inWatchlist ?: true)
            is Net.Err -> r
        }
    }

    suspend fun removeWatchlist(slug: String): Net<Boolean> = withContext(Dispatchers.IO) {
        when (val r = net { Api.service.removeWatchlist(slug) }) {
            is Net.Ok -> Net.Ok(r.value.data?.inWatchlist ?: false)
            is Net.Err -> r
        }
    }

    suspend fun continueWatching(): Net<List<Title>> = withContext(Dispatchers.IO) {
        when (val r = net { Api.service.progressList() }) {
            is Net.Ok -> Net.Ok(r.value.data?.list ?: emptyList())
            is Net.Err -> r
        }
    }

    suspend fun saveProgress(slug: String, episodeId: String?, positionSec: Double, durationSec: Double) =
        withContext(Dispatchers.IO) {
            runCatching {
                Api.service.saveProgress(
                    ProgressRequest(slug, episodeId?.takeIf { it.isNotBlank() }, positionSec, durationSec)
                )
            }
            Unit
        }

    suspend fun subscribe(planCode: String): Net<Pair<User, String>> = withContext(Dispatchers.IO) {
        when (val r = net { Api.service.subscribe(PlanRequest(planCode)) }) {
            is Net.Ok -> {
                val b = r.value.data
                val u = b?.user
                if (u != null) {
                    Session.setUser(u)
                    Net.Ok(u to (b.expiresAt ?: u.vipUntil ?: ""))
                } else Net.Err(r.value.error ?: "subscribe failed")
            }
            is Net.Err -> r
        }
    }

    suspend fun cancelSubscribe(): Net<User> = withContext(Dispatchers.IO) {
        when (val r = net { Api.service.cancelSubscribe() }) {
            is Net.Ok -> {
                val u = r.value.data?.user
                if (u != null) {
                    Session.setUser(u)
                    Net.Ok(u)
                } else Net.Err(r.value.error ?: "cancel failed")
            }
            is Net.Err -> r
        }
    }
}
