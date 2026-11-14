package com.shasha.app.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.clickable
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.KeyboardArrowRight
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.ExitToApp
import androidx.compose.material.icons.filled.Info
import androidx.compose.material.icons.filled.List
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.RadioButton
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
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
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import androidx.navigation.NavHostController
import com.shasha.app.BuildConfig
import com.shasha.app.R
import com.shasha.app.data.Net
import com.shasha.app.data.Repo
import com.shasha.app.data.Session
import com.shasha.app.goDetails
import com.shasha.app.ui.components.EmptyBox
import com.shasha.app.ui.components.ErrorBox
import com.shasha.app.ui.components.PosterCard
import com.shasha.app.ui.components.VipChip
import com.shasha.app.ui.icons.IconCrown
import com.shasha.app.ui.theme.Gold
import com.shasha.app.ui.theme.TextSecondary
import com.shasha.app.util.Lang
import com.shasha.app.util.fmtDate
import kotlinx.coroutines.launch

@Composable
fun ProfileScreen(nav: NavHostController) {
    val user by Session.user.collectAsState()
    val scope = rememberCoroutineScope()
    var showLang by remember { mutableStateOf(false) }
    var showAbout by remember { mutableStateOf(false) }
    var showLogout by remember { mutableStateOf(false) }

    val watchlistCount by produceState(initialValue = 0, key1 = user?.id) {
        if (user != null) {
            when (val r = Repo.watchlist()) {
                is Net.Ok -> value = r.value.size
                is Net.Err -> Unit
            }
        } else value = 0
    }

    Column(Modifier.fillMaxSize()) {
        // بطاقة المستخدم
        Column(
            Modifier
                .fillMaxWidth()
                .padding(20.dp)
        ) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Box(
                    Modifier
                        .size(64.dp)
                        .clip(CircleShape)
                        .background(Color(android.graphics.Color.parseColor(user?.avatarColor ?: "#00d26a"))),
                    contentAlignment = Alignment.Center,
                ) {
                    Text(
                        (user?.name ?: stringResource(R.string.guest)).trim().take(1).uppercase(),
                        color = Color.White,
                        style = MaterialTheme.typography.headlineSmall,
                    )
                }
                Column(Modifier.weight(1f).padding(horizontal = 14.dp)) {
                    Text(
                        user?.name ?: stringResource(R.string.guest),
                        style = MaterialTheme.typography.headlineSmall,
                    )
                    Text(
                        user?.email ?: stringResource(R.string.desc_profile),
                        color = TextSecondary,
                        style = MaterialTheme.typography.bodyMedium,
                    )
                    if (user?.isVip == true) {
                        Spacer(Modifier.height(6.dp))
                        Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                            VipChip()
                            Text(
                                stringResource(R.string.vip_active_until, fmtDate(user?.vipUntil)),
                                color = Gold,
                                style = MaterialTheme.typography.labelMedium,
                            )
                        }
                    }
                }
            }

            if (user == null) {
                Spacer(Modifier.height(18.dp))
                Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                    Button(
                        onClick = { nav.navigate("auth?mode=login") },
                        modifier = Modifier.weight(1f).height(48.dp),
                        shape = RoundedCornerShape(12.dp),
                    ) { Text(stringResource(R.string.login)) }
                    OutlinedButton(
                        onClick = { nav.navigate("auth?mode=register") },
                        modifier = Modifier.weight(1f).height(48.dp),
                        shape = RoundedCornerShape(12.dp),
                    ) { Text(stringResource(R.string.register)) }
                }
            }
        }

        HorizontalDivider(color = MaterialTheme.colorScheme.outline.copy(alpha = 0.5f))

        // الصفوف
        ProfileRow(
            icon = { Icon(Icons.Default.List, contentDescription = null, tint = MaterialTheme.colorScheme.primary) },
            label = stringResource(R.string.my_list),
            trailing = "$watchlistCount",
        ) { nav.navigate("list") }

        ProfileRow(
            icon = { Icon(IconCrown, contentDescription = null, tint = Gold) },
            label = stringResource(R.string.tab_vip),
            trailing = "",
        ) { nav.navigate("vip") }

        ProfileRow(
            icon = {
                Box(
                    Modifier
                        .size(24.dp)
                        .clip(CircleShape)
                        .background(MaterialTheme.colorScheme.primaryContainer),
                    contentAlignment = Alignment.Center,
                ) {
                    Text("عA", color = MaterialTheme.colorScheme.onPrimaryContainer, style = MaterialTheme.typography.labelMedium)
                }
            },
            label = stringResource(R.string.language),
            trailing = if (Lang.current() == "ar") stringResource(R.string.arabic) else stringResource(R.string.english),
        ) { showLang = true }

        ProfileRow(
            icon = { Icon(Icons.Default.Info, contentDescription = null, tint = TextSecondary) },
            label = stringResource(R.string.about),
            trailing = "",
        ) { showAbout = true }

        if (user != null) {
            ProfileRow(
                icon = { Icon(Icons.Default.ExitToApp, contentDescription = null, tint = MaterialTheme.colorScheme.error) },
                label = stringResource(R.string.logout),
                trailing = "",
            ) { showLogout = true }
        }

        Spacer(Modifier.weight(1f))
    }

    // نافذة اللغة
    if (showLang) {
        AlertDialog(
            onDismissRequest = { showLang = false },
            title = { Text(stringResource(R.string.language)) },
            text = {
                Column {
                    LangOption(stringResource(R.string.arabic), Lang.current() == "ar") { Lang.apply("ar"); showLang = false }
                    LangOption(stringResource(R.string.english), Lang.current() == "en") { Lang.apply("en"); showLang = false }
                }
            },
            confirmButton = {},
            dismissButton = {
                TextButton(onClick = { showLang = false }) { Text(stringResource(R.string.cancel)) }
            },
        )
    }

    // نافذة عن التطبيق
    if (showAbout) {
        AlertDialog(
            onDismissRequest = { showAbout = false },
            title = { Text("شاشة • SHASHA") },
            text = {
                Column {
                    Text("${stringResource(R.string.version)} 2.0.0 (أصلي • Native)", style = MaterialTheme.typography.bodyMedium)
                    Spacer(Modifier.height(6.dp))
                    Text("Kotlin + Jetpack Compose + Media3", color = TextSecondary, style = MaterialTheme.typography.bodySmall)
                    Spacer(Modifier.height(6.dp))
                    Text("الخادم: ${BuildConfig.API_BASE.removePrefix("https://")}", color = TextSecondary, style = MaterialTheme.typography.bodySmall)
                }
            },
            confirmButton = {
                TextButton(onClick = { showAbout = false }) { Text(stringResource(R.string.details)) }
            },
        )
    }

    // تأكيد الخروج
    if (showLogout) {
        AlertDialog(
            onDismissRequest = { showLogout = false },
            title = { Text(stringResource(R.string.logout)) },
            text = { Text(stringResource(R.string.logout_confirm)) },
            confirmButton = {
                TextButton(onClick = {
                    showLogout = false
                    scope.launch { Session.logout() }
                }) { Text(stringResource(R.string.logout), color = MaterialTheme.colorScheme.error) }
            },
            dismissButton = {
                TextButton(onClick = { showLogout = false }) { Text(stringResource(R.string.cancel)) }
            },
        )
    }
}

@Composable
private fun LangOption(label: String, selected: Boolean, onClick: () -> Unit) {
    Row(
        Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(10.dp))
            .clickable(onClick = onClick)
            .padding(vertical = 8.dp, horizontal = 4.dp),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        RadioButton(selected = selected, onClick = onClick)
        Text(label, style = MaterialTheme.typography.bodyLarge, modifier = Modifier.padding(start = 4.dp))
    }
}

@Composable
private fun ProfileRow(
    icon: @Composable () -> Unit,
    label: String,
    trailing: String,
    onClick: () -> Unit,
) {
    Row(
        Modifier
            .fillMaxWidth()
            .clickable(onClick = onClick)
            .padding(horizontal = 20.dp, vertical = 15.dp),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(14.dp),
    ) {
        icon()
        Text(label, style = MaterialTheme.typography.titleMedium, modifier = Modifier.weight(1f))
        if (trailing.isNotBlank()) {
            Text(trailing, color = TextSecondary, style = MaterialTheme.typography.bodyMedium)
        }
        Icon(
            Icons.AutoMirrored.Filled.KeyboardArrowRight,
            contentDescription = null,
            tint = TextSecondary,
        )
    }
}

// ============================================================
// شاشة قائمتي
// ============================================================
@Composable
fun WatchlistScreen(nav: NavHostController) {
    val user by Session.user.collectAsState()
    val scope = rememberCoroutineScope()
    var tick by remember { mutableStateOf(0) }
    val state by produceState(
        initialValue = UiState.loading<List<com.shasha.app.data.Title>>(),
        key1 = user?.id,
        key2 = tick,
    ) {
        value = if (user == null) UiState(data = emptyList())
        else when (val r = Repo.watchlist()) {
            is Net.Ok -> UiState(data = r.value)
            is Net.Err -> UiState(error = r.message, networkError = r.code == com.shasha.app.data.NET_CODE_NETWORK)
        }
    }

    Column(Modifier.fillMaxSize()) {
        Text(
            stringResource(R.string.my_list),
            style = MaterialTheme.typography.headlineMedium,
            modifier = Modifier.padding(horizontal = 20.dp, vertical = 16.dp),
        )
        when {
            user == null -> EmptyBox(stringResource(R.string.login_to_continue))
            state.loading -> Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                CircularProgressIndicator(color = MaterialTheme.colorScheme.primary)
            }
            state.error != null -> ErrorBox(state.error ?: "", state.networkError, { tick++ })
            else -> {
                val list = state.data ?: emptyList()
                if (list.isEmpty()) {
                    EmptyBox(stringResource(R.string.no_results))
                } else {
                    LazyVerticalGrid(
                        columns = GridCells.Fixed(3),
                        contentPadding = PaddingValues(horizontal = 10.dp, vertical = 4.dp),
                        horizontalArrangement = Arrangement.spacedBy(6.dp),
                        verticalArrangement = Arrangement.spacedBy(6.dp),
                    ) {
                        items(list, key = { it.id }) { t ->
                            Box {
                                PosterCard(
                                    t,
                                    onClick = { nav.goDetails(t.slug) },
                                    modifier = Modifier.fillMaxWidth(),
                                    width = null,
                                )
                                IconButton(
                                    onClick = {
                                        scope.launch { Repo.removeWatchlist(t.slug) }
                                        tick++
                                    },
                                    modifier = Modifier
                                        .align(Alignment.TopEnd)
                                        .size(30.dp)
                                        .clip(CircleShape)
                                        .background(MaterialTheme.colorScheme.surfaceContainerHigh),
                                ) {
                                    Icon(Icons.Default.Close, contentDescription = stringResource(R.string.remove_from_list), modifier = Modifier.size(15.dp))
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}
