package com.shasha.app.data

import android.content.Context
import android.content.SharedPreferences
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.withContext

// ============================================================
// إدارة الجلسة — المستخدم الحالي + تسجيل الدخول/الخروج
// ============================================================

object Session {
    private lateinit var prefs: SharedPreferences

    private val _user = MutableStateFlow<User?>(null)
    val user: StateFlow<User?> = _user

    fun init(context: Context) {
        prefs = context.getSharedPreferences("shasha_session", Context.MODE_PRIVATE)
        val cached = prefs.getString("user", null)
        _user.value = cached?.let { runCatching { Api.json.decodeFromString<User>(it) }.getOrNull() }
    }

    fun setUser(u: User?) {
        _user.value = u
        prefs.edit().putString("user", u?.let { Api.json.encodeToString(User.serializer(), it) } ?: "").apply()
    }

    suspend fun refresh(): User? = withContext(Dispatchers.IO) {
        when (val r = net { Api.service.me() }) {
            is Net.Ok -> {
                val u = r.value.user
                setUser(u)
                u
            }
            is Net.Err -> null
        }
    }

    suspend fun login(email: String, password: String): Net<User> = withContext(Dispatchers.IO) {
        when (val r = net { Api.service.login(LoginRequest(email.trim().lowercase(), password)) }) {
            is Net.Ok -> {
                val u = r.value.data?.user
                if (u != null) {
                    setUser(u)
                    Net.Ok(u)
                } else Net.Err(r.value.error ?: "login failed")
            }
            is Net.Err -> r
        }
    }

    suspend fun register(email: String, name: String, password: String): Net<User> = withContext(Dispatchers.IO) {
        when (val r = net { Api.service.register(RegisterRequest(email.trim().lowercase(), name.trim(), password)) }) {
            is Net.Ok -> {
                val u = r.value.data?.user
                if (u != null) {
                    setUser(u)
                    Net.Ok(u)
                } else Net.Err(r.value.error ?: "register failed")
            }
            is Net.Err -> r
        }
    }

    suspend fun logout() = withContext(Dispatchers.IO) {
        runCatching { Api.service.logout() }
        Api.clearCookies()
        setUser(null)
        Unit
    }
}
