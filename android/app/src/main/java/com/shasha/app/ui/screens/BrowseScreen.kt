package com.shasha.app.ui.screens

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
import androidx.compose.material3.FilterChip
import androidx.compose.material3.FilterChipDefaults
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.produceState
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
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

@Composable
fun BrowseScreen(nav: NavHostController, initialType: String?, initialGenre: String?) {
    var type by remember { mutableStateOf(initialType) }
    var genre by remember { mutableStateOf(initialGenre) }
    var sort by remember { mutableStateOf("popular") }

    val genres by produceState(initialValue = emptyList<Genre>()) {
        when (val r = Repo.genres()) {
            is Net.Ok -> value = r.value
            is Net.Err -> Unit
        }
    }

    val state by produceState(
        initialValue = UiState.loading<List<com.shasha.app.data.Title>>(),
        key1 = type,
        key2 = genre,
        key3 = sort,
    ) {
        value = when (val r = Repo.titles(type = type, genre = genre, sort = sort, limit = 60)) {
            is Net.Ok -> UiState(data = r.value)
            is Net.Err -> UiState(error = r.message, networkError = r.code == com.shasha.app.data.NET_CODE_NETWORK)
        }
    }

    Column(Modifier.fillMaxSize().statusBarsPadding()) {
        // شرائح النوع
        Row(
            Modifier
                .fillMaxWidth()
                .padding(horizontal = 16.dp, vertical = 8.dp),
            horizontalArrangement = Arrangement.spacedBy(8.dp),
        ) {
            TypeChip(stringResource(R.string.all), type == null) { type = null }
            TypeChip(stringResource(R.string.movies), type == "MOVIE") { type = "MOVIE" }
            TypeChip(stringResource(R.string.series), type == "SERIES") { type = "SERIES" }
            Spacer(Modifier.width(8.dp))
            TypeChip(
                if (sort == "newest") stringResource(R.string.sort_newest) else stringResource(R.string.sort_popular),
                false,
            ) { sort = if (sort == "newest") "popular" else "newest" }
        }

        // شرائح التصنيفات
        if (genres.isNotEmpty()) {
            LazyRow(
                contentPadding = PaddingValues(horizontal = 16.dp),
                horizontalArrangement = Arrangement.spacedBy(8.dp),
            ) {
                item {
                    GenreChipG(stringResource(R.string.all), genre == null) { genre = null }
                }
                items(genres, key = { it.slug }) { g ->
                    GenreChipG(g.locName(), genre == g.slug) { genre = if (genre == g.slug) null else g.slug }
                }
            }
            Spacer(Modifier.height(4.dp))
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
            state.error != null -> ErrorBox(state.error ?: "", state.networkError, { nav.navigateUp() })
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
}

@Composable
private fun TypeChip(label: String, selected: Boolean, onClick: () -> Unit) {
    FilterChip(
        selected = selected,
        onClick = onClick,
        label = { Text(label) },
        shape = RoundedCornerShape(50),
        colors = FilterChipDefaults.filterChipColors(
            selectedContainerColor = MaterialTheme.colorScheme.primaryContainer,
            selectedLabelColor = MaterialTheme.colorScheme.onPrimaryContainer,
        ),
    )
}

@Composable
private fun GenreChipG(label: String, selected: Boolean, onClick: () -> Unit) {
    FilterChip(
        selected = selected,
        onClick = onClick,
        label = { Text(label, style = MaterialTheme.typography.labelMedium) },
        shape = RoundedCornerShape(50),
        colors = FilterChipDefaults.filterChipColors(
            containerColor = MaterialTheme.colorScheme.surfaceContainerHigh,
            selectedContainerColor = MaterialTheme.colorScheme.primaryContainer,
            selectedLabelColor = MaterialTheme.colorScheme.onPrimaryContainer,
        ),
    )
}
