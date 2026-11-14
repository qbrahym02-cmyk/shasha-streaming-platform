package com.shasha.app.ui.screens

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.imePadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material3.Button
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.text.input.VisualTransformation
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.navigation.NavHostController
import com.shasha.app.R
import com.shasha.app.data.Session
import com.shasha.app.ui.icons.IconCrown
import com.shasha.app.ui.icons.IconEye
import com.shasha.app.ui.icons.IconEyeOff
import com.shasha.app.ui.theme.Gold
import kotlinx.coroutines.launch

@Composable
fun AuthScreen(nav: NavHostController, mode: String) {
    var isLogin by remember { mutableStateOf(mode != "register") }
    val scope = rememberCoroutineScope()

    var email by remember { mutableStateOf("") }
    var name by remember { mutableStateOf("") }
    var password by remember { mutableStateOf("") }
    var showPass by remember { mutableStateOf(false) }
    var busy by remember { mutableStateOf(false) }
    var error by remember { mutableStateOf<String?>(null) }

    fun submit() {
        if (busy) return
        error = null
        if (email.isBlank() || password.isBlank() || (!isLogin && name.isBlank())) {
            error = "⚠"
            return
        }
        busy = true
        scope.launch {
            val r = if (isLogin) Session.login(email, password)
            else Session.register(email, name, password)
            busy = false
            when (r) {
                is com.shasha.app.data.Net.Ok -> nav.popBackStack()
                is com.shasha.app.data.Net.Err -> error = r.message
            }
        }
    }

    Column(
        Modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState())
            .imePadding()
            .padding(horizontal = 24.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
    ) {
        IconButton(
            onClick = { nav.popBackStack() },
            modifier = Modifier
                .align(Alignment.Start)
                .padding(top = 10.dp),
        ) {
            Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = null)
        }

        Spacer(Modifier.height(12.dp))
        Icon(
            IconCrown,
            contentDescription = null,
            tint = Gold,
            modifier = Modifier.size(46.dp),
        )
        Spacer(Modifier.height(8.dp))
        Text("شاشة", style = MaterialTheme.typography.headlineLarge)
        Text(
            if (isLogin) stringResource(R.string.login) else stringResource(R.string.register),
            color = MaterialTheme.colorScheme.onSurfaceVariant,
            style = MaterialTheme.typography.bodyLarge,
        )
        Spacer(Modifier.height(26.dp))

        if (!isLogin) {
            OutlinedTextField(
                value = name,
                onValueChange = { name = it },
                label = { Text(stringResource(R.string.full_name)) },
                modifier = Modifier.fillMaxWidth(),
                singleLine = true,
                shape = RoundedCornerShape(13.dp),
                keyboardOptions = KeyboardOptions(imeAction = ImeAction.Next),
                colors = fieldColors(),
            )
            Spacer(Modifier.height(12.dp))
        }

        OutlinedTextField(
            value = email,
            onValueChange = { email = it },
            label = { Text(stringResource(R.string.email)) },
            modifier = Modifier.fillMaxWidth(),
            singleLine = true,
            shape = RoundedCornerShape(13.dp),
            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Email, imeAction = ImeAction.Next),
            colors = fieldColors(),
        )
        Spacer(Modifier.height(12.dp))

        OutlinedTextField(
            value = password,
            onValueChange = { password = it },
            label = { Text(stringResource(R.string.password)) },
            modifier = Modifier.fillMaxWidth(),
            singleLine = true,
            shape = RoundedCornerShape(13.dp),
            visualTransformation = if (showPass) VisualTransformation.None else PasswordVisualTransformation(),
            keyboardOptions = KeyboardOptions(
                keyboardType = KeyboardType.Password,
                imeAction = ImeAction.Done,
            ),
            trailingIcon = {
                IconButton(onClick = { showPass = !showPass }) {
                    Icon(
                        if (showPass) IconEyeOff else IconEye,
                        contentDescription = null,
                    )
                }
            },
            colors = fieldColors(),
        )
        Spacer(Modifier.height(8.dp))

        if (error != null && error != "⚠") {
            Text(
                error ?: "",
                color = MaterialTheme.colorScheme.error,
                style = MaterialTheme.typography.bodyMedium,
                textAlign = TextAlign.Center,
                modifier = Modifier.fillMaxWidth().padding(vertical = 6.dp),
            )
        }
        if (error == "⚠") {
            Text(
                stringResource(R.string.error_generic),
                color = MaterialTheme.colorScheme.error,
                style = MaterialTheme.typography.bodyMedium,
                modifier = Modifier.fillMaxWidth().padding(vertical = 6.dp),
            )
        }

        Spacer(Modifier.height(10.dp))
        Button(
            onClick = { submit() },
            enabled = !busy,
            modifier = Modifier.fillMaxWidth().height(52.dp),
            shape = RoundedCornerShape(13.dp),
        ) {
            if (busy) {
                CircularProgressIndicator(modifier = Modifier.size(22.dp), strokeWidth = 2.dp, color = MaterialTheme.colorScheme.onPrimary)
            } else {
                Text(
                    if (isLogin) stringResource(R.string.login) else stringResource(R.string.register),
                    style = MaterialTheme.typography.titleMedium,
                )
            }
        }

        TextButton(onClick = { isLogin = !isLogin; error = null }) {
            Text(
                if (isLogin) stringResource(R.string.no_account) else stringResource(R.string.have_account),
                color = MaterialTheme.colorScheme.primary,
            )
        }

        Spacer(Modifier.height(10.dp))
        Text(
            stringResource(R.string.demo_accounts),
            color = MaterialTheme.colorScheme.onSurfaceVariant,
            style = MaterialTheme.typography.labelMedium,
        )
        Spacer(Modifier.height(8.dp))
        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            DemoChip("demo@shasha.app", "VIP") { email = "demo@shasha.app"; password = "demo1234"; isLogin = true }
            DemoChip("free@shasha.app", null) { email = "free@shasha.app"; password = "demo1234"; isLogin = true }
        }
        Text(
            "demo1234",
            color = MaterialTheme.colorScheme.onSurfaceVariant,
            style = MaterialTheme.typography.labelSmall,
        )
        Spacer(Modifier.height(26.dp))
    }
}

@Composable
private fun fieldColors() = OutlinedTextFieldDefaults.colors(
    focusedBorderColor = MaterialTheme.colorScheme.primary,
    unfocusedBorderColor = MaterialTheme.colorScheme.outline,
    focusedLabelColor = MaterialTheme.colorScheme.primary,
)

@Composable
private fun DemoChip(email: String, badge: String?, onClick: () -> Unit) {
    androidx.compose.material3.AssistChip(
        onClick = onClick,
        label = { Text(email.split("@")[0], style = MaterialTheme.typography.labelMedium) },
        leadingIcon = {
            if (badge != null) {
                Icon(IconCrown, contentDescription = null, tint = Gold, modifier = Modifier.size(13.dp))
            }
        },
    )
}
