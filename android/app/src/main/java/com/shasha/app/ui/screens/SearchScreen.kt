package com.shasha.app.ui.screens

import androidx.compose.foundation.clickable
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
import androidx.compose.foundation.layout.statusBarsPadding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.Search
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.produceState
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.navigation.NavHostController
import com.shasha.app.R
import com.shasha.app.data.Genre
import com.shasha.app.data.Net
import com.shasha.app.data.Repo
import com.shasha.app.goDetails
import com.shasha.app.ui.components.EmptyBox
import com.shasha.app.ui.components.ErrorBox
import com.shasha.app.ui.components.PosterCard
import com.shasha.app.ui.components.ShimmerPoster
import com.shasha.app.ui.components.locName
import com.shasha.app.ui.theme.TextSecondary
import kotlinx.coroutines.delay

@Composable
fun SearchScreen(nav: NavHostController) {
    var query by remember { mutableStateOf("") }
    val genres by produceState(initialValue = emptyList<Genre>()) {
        when (val r = Repo.genres()) {
            is Net.Ok -> value = r.value
            is Net.Err -> Unit
        }
    }

    Column(Modifier.fillMaxSize().statusBarsPadding()) {
        // حقل البحث
        OutlinedTextField(
            value = query,
            onValueChange = { query = it },
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 16.dp, vertical = 10.dp),
            placeholder = { Text(stringResource(R.string.search_hint)) },
            leadingIcon = { Icon(Icons.Default.Search, contentDescription = null, tint = TextSecondary) },
            trailingIcon = {
                if (query.isNotEmpty()) {
                    IconButton(onClick = { query = "" }) {
                        Icon(Icons.Default.Close, contentDescription = null)
                    }
                }
            },
            singleLine = true,
            shape = RoundedCornerShape(14.dp),
            keyboardOptions = KeyboardOptions(imeAction = ImeAction.Search),
            colors = OutlinedTextFieldDefaults.colors(
                focusedBorderColor = MaterialTheme.colorScheme.primary,
                unfocusedBorderColor = MaterialTheme.colorScheme.outline,
            ),
        )

        // شرائح التصنيفات
        if (genres.isNotEmpty()) {
            LazyRow(
                contentPadding = PaddingValues(horizontal = 16.dp),
                horizontalArrangement = Arrangement.spacedBy(8.dp),
            ) {
                items(genres, key = { it.slug }) { g ->
                    Box(
                        Modifier
                            .clip(RoundedCornerShape(50))
                            .clickable { nav.navigate("browse?genre=${g.slug}") }
                            .padding(2.dp)
                    ) {
                        Text(
                            g.locName(),
                            style = MaterialTheme.typography.labelLarge,
                            color = TextSecondary,
                            modifier = Modifier.padding(horizontal = 14.dp, vertical = 8.dp),
                        )
                    }
                }
            }
            Spacer(Modifier.height(6.dp))
        }

        // النتائج (مع تثبيط نبضات الكتابة)
        if (query.isBlank()) {
            Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                Text(stringResource(R.string.search_empty), color = TextSecondary, style = MaterialTheme.typography.bodyLarge)
            }
        } else {
            SearchResults(nav, query)
        }
    }
}

@Composable
private fun SearchResults(nav: NavHostController, query: String) {
    var tick by remember { mutableStateOf(0) }
    val state by produceState(
        initialValue = UiState.loading<List<com.shasha.app.data.Title>>(),
        key1 = query,
        key2 = tick,
    ) {
        delay(400) // تثبيط نبضات
        value = when (val r = Repo.titles(q = query, limit = 40)) {
            is Net.Ok -> UiState(data = r.value)
            is Net.Err -> UiState(error = r.message, networkError = r.code == com.shasha.app.data.NET_CODE_NETWORK)
        }
    }

    when {
        state.loading -> Row(
            Modifier
                .fillMaxWidth()
                .padding(16.dp),
            horizontalArrangement = Arrangement.spacedBy(10.dp),
        ) {
            repeat(3) { ShimmerPoster(Modifier.weight(1f)) }
        }
        state.error != null -> ErrorBox(state.error ?: "", state.networkError, { tick++ })
        else -> {
            val list = state.data ?: emptyList()
            if (list.isEmpty()) {
                EmptyBox(stringResource(R.string.no_results))
            } else {
                LazyVerticalGrid(
                    columns = GridCells.Fixed(3),
                    contentPadding = PaddingValues(horizontal = 10.dp, vertical = 8.dp),
                    horizontalArrangement = Arrangement.spacedBy(6.dp),
                    verticalArrangement = Arrangement.spacedBy(6.dp),
                ) {
                    items(list, key = { it.id }) { t ->
                        PosterCard(
                            t,
                            onClick = { nav.goDetails(t.slug) },
                            modifier = Modifier.fillMaxWidth(),
                            width = null,
                        )
                    }
                }
            }
        }
    }
}
