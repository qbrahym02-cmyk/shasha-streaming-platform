package com.shasha.app.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
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
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Check
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.SnackbarHost
import androidx.compose.material3.SnackbarHostState
import androidx.compose.material3.Text
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
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.navigation.NavHostController
import com.shasha.app.R
import com.shasha.app.data.Net
import com.shasha.app.data.Plan
import com.shasha.app.data.Repo
import com.shasha.app.data.Session
import com.shasha.app.ui.components.ErrorBox
import com.shasha.app.ui.components.ShimmerPoster
import com.shasha.app.ui.components.isArabic
import com.shasha.app.ui.icons.IconCrown
import com.shasha.app.ui.theme.Gold
import com.shasha.app.util.fmtDate
import kotlinx.coroutines.launch

@Composable
fun VipScreen(nav: NavHostController) {
    val user by Session.user.collectAsState()
    val scope = rememberCoroutineScope()
    val snackbar = remember { SnackbarHostState() }
    val vipSuccess = stringResource(R.string.vip_success)
    val vipCancelled = stringResource(R.string.vip_cancelled)

    var busy by remember { mutableStateOf<String?>(null) }
    var error by remember { mutableStateOf<String?>(null) }

    val plansState by produceState(initialValue = UiState.loading<List<Plan>>()) {
        value = when (val r = Repo.plans()) {
            is Net.Ok -> UiState(data = r.value)
            is Net.Err -> UiState(error = r.message, networkError = r.code == com.shasha.app.data.NET_CODE_NETWORK)
        }
    }

    Box(Modifier.fillMaxSize()) {
        LazyColumn(Modifier.fillMaxSize()) {
            // رأس VIP
            item {
                Column(
                    Modifier
                        .fillMaxWidth()
                        .background(
                            Brush.verticalGradient(
                                0f to MaterialTheme.colorScheme.primaryContainer.copy(alpha = 0.35f),
                                1f to MaterialTheme.colorScheme.background,
                            )
                        )
                        .padding(horizontal = 20.dp, vertical = 30.dp),
                    horizontalAlignment = Alignment.CenterHorizontally,
                ) {
                    Icon(
                        IconCrown,
                        contentDescription = null,
                        tint = Gold,
                        modifier = Modifier.size(56.dp),
                    )
                    Spacer(Modifier.height(10.dp))
                    Text(
                        stringResource(R.string.vip_title),
                        style = MaterialTheme.typography.headlineLarge,
                        textAlign = TextAlign.Center,
                    )
                    Spacer(Modifier.height(6.dp))
                    Text(
                        stringResource(R.string.vip_subtitle),
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                        style = MaterialTheme.typography.bodyMedium,
                        textAlign = TextAlign.Center,
                    )
                }
            }

            // حالة العضوية الحالية
            item {
                val u = user
                if (u?.isVip == true) {
                    Card(
                        Modifier
                            .fillMaxWidth()
                            .padding(horizontal = 16.dp, vertical = 8.dp),
                        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.primaryContainer),
                        shape = RoundedCornerShape(16.dp),
                    ) {
                        Column(Modifier.padding(16.dp)) {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Icon(IconCrown, contentDescription = null, tint = Gold, modifier = Modifier.size(20.dp))
                                Spacer(Modifier.width(8.dp))
                                Text(
                                    stringResource(R.string.vip_active),
                                    style = MaterialTheme.typography.titleMedium,
                                    color = MaterialTheme.colorScheme.onPrimaryContainer,
                                )
                            }
                            Spacer(Modifier.height(6.dp))
                            Text(
                                stringResource(R.string.vip_active_until, fmtDate(u.vipUntil)),
                                color = MaterialTheme.colorScheme.onPrimaryContainer,
                                style = MaterialTheme.typography.bodyMedium,
                            )
                            Spacer(Modifier.height(10.dp))
                            OutlinedButton(
                                onClick = {
                                    busy = "cancel"
                                    scope.launch {
                                        when (Repo.cancelSubscribe()) {
                                            is Net.Ok -> snackbar.showSnackbar(vipCancelled)
                                            is Net.Err -> error = null
                                        }
                                        busy = null
                                    }
                                },
                                enabled = busy == null,
                            ) { Text(stringResource(R.string.vip_cancel)) }
                        }
                    }
                }
            }

            // الباقات
            when {
                plansState.loading -> item {
                    Row(
                        Modifier
                            .fillMaxWidth()
                            .padding(16.dp),
                        horizontalArrangement = Arrangement.spacedBy(10.dp),
                    ) {
                        repeat(3) { ShimmerPoster(Modifier.weight(1f)) }
                    }
                }
                plansState.error != null -> item {
                    ErrorBox(plansState.error ?: "", plansState.networkError, { })
                }
                else -> {
                    val plans = plansState.data ?: emptyList()
                    items(plans, key = { it.code }) { plan ->
                        PlanCard(
                            plan = plan,
                            busy = busy == plan.code,
                            onSubscribe = {
                                val u = user
                                if (u == null) {
                                    nav.navigate("auth")
                                } else {
                                    busy = plan.code
                                    scope.launch {
                                        when (val r = Repo.subscribe(plan.code)) {
                                            is Net.Ok -> snackbar.showSnackbar(vipSuccess)
                                            is Net.Err -> snackbar.showSnackbar(r.message)
                                        }
                                        busy = null
                                    }
                                }
                            },
                        )
                    }
                    item {
                        Text(
                            stringResource(R.string.payment_demo_note),
                            color = MaterialTheme.colorScheme.onSurfaceVariant,
                            style = MaterialTheme.typography.labelMedium,
                            textAlign = TextAlign.Center,
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(horizontal = 24.dp, vertical = 12.dp),
                        )
                    }
                }
            }
            item { Spacer(Modifier.height(28.dp)) }
        }
        SnackbarHost(snackbar, Modifier.align(Alignment.BottomCenter))
    }
}

@Composable
private fun PlanCard(plan: Plan, busy: Boolean, onSubscribe: () -> Unit) {
    val borderColor = if (plan.highlight) Gold else MaterialTheme.colorScheme.outline
    Card(
        Modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp, vertical = 8.dp)
            .border(1.5.dp, borderColor, RoundedCornerShape(18.dp)),
        colors = CardDefaults.cardColors(
            containerColor = if (plan.highlight) MaterialTheme.colorScheme.secondaryContainer.copy(alpha = 0.25f)
            else MaterialTheme.colorScheme.surfaceContainer
        ),
        shape = RoundedCornerShape(18.dp),
    ) {
        Column(Modifier.padding(18.dp)) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Column(Modifier.weight(1f)) {
                    Text(
                        if (isArabic()) plan.nameAr else plan.nameEn,
                        style = MaterialTheme.typography.titleLarge,
                    )
                    Text(
                        monthsLabel(plan.months),
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                        style = MaterialTheme.typography.labelMedium,
                    )
                }
                Column(horizontalAlignment = Alignment.End) {
                    val price = if (plan.priceDzd == plan.priceDzd.toLong().toDouble()) {
                        "${plan.priceDzd.toLong()}"
                    } else {
                        "${plan.priceDzd}"
                    }
                    Text(
                        "$price ${stringResource(R.string.dzd)}",
                        style = MaterialTheme.typography.headlineSmall,
                        color = if (plan.highlight) Gold else MaterialTheme.colorScheme.primary,
                    )
                    plan.originalDzd?.let { orig ->
                        Text(
                            "$orig",
                            color = MaterialTheme.colorScheme.onSurfaceVariant,
                            style = MaterialTheme.typography.labelMedium,
                            textDecoration = androidx.compose.ui.text.style.TextDecoration.LineThrough,
                        )
                    }
                }
            }

            Spacer(Modifier.height(12.dp))
            val features = if (isArabic()) plan.featuresAr else plan.featuresEn
            features.forEach { f ->
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(8.dp),
                    modifier = Modifier.padding(vertical = 3.dp),
                ) {
                    Icon(
                        Icons.Default.Check,
                        contentDescription = null,
                        tint = MaterialTheme.colorScheme.primary,
                        modifier = Modifier.size(15.dp),
                    )
                    Text(f, style = MaterialTheme.typography.bodyMedium, color = MaterialTheme.colorScheme.onSurfaceVariant)
                }
            }

            Spacer(Modifier.height(14.dp))
            Button(
                onClick = onSubscribe,
                enabled = !busy,
                modifier = Modifier.fillMaxWidth().height(50.dp),
                shape = RoundedCornerShape(13.dp),
                colors = ButtonDefaults.buttonColors(
                    containerColor = if (plan.highlight) Gold else MaterialTheme.colorScheme.primary,
                    contentColor = if (plan.highlight) Color(0xFF191300) else MaterialTheme.colorScheme.onPrimary,
                ),
            ) {
                if (busy) {
                    CircularProgressIndicator(modifier = Modifier.size(20.dp), strokeWidth = 2.dp, color = MaterialTheme.colorScheme.onPrimary)
                } else {
                    Text(stringResource(R.string.activate), style = MaterialTheme.typography.titleMedium)
                }
            }
        }
    }
}

@Composable
private fun monthsLabel(months: Int): String = when (months) {
    1 -> if (isArabic()) "شهر واحد" else "1 month"
    2 -> if (isArabic()) "شهرين" else "2 months"
    in 3..10 -> if (isArabic()) "$months أشهر" else "$months months"
    else -> if (isArabic()) "$months شهرًا" else "$months months"
}
