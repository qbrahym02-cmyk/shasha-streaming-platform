package com.shasha.app

import android.app.PictureInPictureParams
import android.content.res.Configuration
import android.os.Build
import android.os.Bundle
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.appcompat.app.AppCompatActivity
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Home
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.Search
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.NavigationBarItemDefaults
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.core.splashscreen.SplashScreen.Companion.installSplashScreen
import androidx.navigation.NavHostController
import androidx.navigation.NavType
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.currentBackStackEntryAsState
import androidx.navigation.compose.rememberNavController
import androidx.navigation.navArgument
import com.shasha.app.ui.icons.IconCrown
import com.shasha.app.ui.screens.AuthScreen
import com.shasha.app.ui.screens.BrowseScreen
import com.shasha.app.ui.screens.DetailsScreen
import com.shasha.app.ui.screens.HomeScreen
import com.shasha.app.ui.screens.PlayerScreen
import com.shasha.app.ui.screens.ProfileScreen
import com.shasha.app.ui.screens.SearchScreen
import com.shasha.app.ui.screens.VipScreen
import com.shasha.app.ui.screens.WatchlistScreen
import com.shasha.app.ui.theme.ShashaTheme

// حالة المشغل العالمية (لنمط PiP)
object PlayerRuntime {
    var active: Boolean = false
    var playing: Boolean = false
}

class MainActivity : AppCompatActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        installSplashScreen()
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            ShashaTheme {
                AppRoot()
            }
        }
    }

    @Deprecated("Deprecated in Java")
    override fun onUserLeaveHint() {
        super.onUserLeaveHint()
        if (PlayerRuntime.active && PlayerRuntime.playing && Build.VERSION.SDK_INT >= 26) {
            try {
                enterPictureInPictureMode(
                    PictureInPictureParams.Builder().build()
                )
            } catch (_: Exception) {
            }
        }
    }

    override fun onPictureInPictureModeChanged(isInPictureInPictureMode: Boolean, newConfig: Configuration) {
        super.onPictureInPictureModeChanged(isInPictureInPictureMode, newConfig)
        // في وضع PiP تخفي الواجهة عناصر التحكم تلقائياً (يديرها PlayerScreen)
    }
}

private data class TabItem(
    val route: String,
    val labelRes: Int,
    val icon: @Composable () -> Unit,
)

@Composable
fun AppRoot() {
    val nav = rememberNavController()
    val backStack by nav.currentBackStackEntryAsState()
    val currentRoute = backStack?.destination?.route

    val tabs = listOf(
        TabItem("home", R.string.tab_home) { Icon(Icons.Default.Home, contentDescription = null) },
        TabItem("search", R.string.tab_search) { Icon(Icons.Default.Search, contentDescription = null) },
        TabItem("vip", R.string.tab_vip) { Icon(IconCrown, contentDescription = null) },
        TabItem("profile", R.string.tab_profile) { Icon(Icons.Default.Person, contentDescription = null) },
    )
    val showBar = currentRoute in setOf(
        "home", "search", "vip", "profile", "list",
        "browse?type={type}&genre={genre}",
    )

    Scaffold(
        containerColor = MaterialTheme.colorScheme.background,
        bottomBar = {
            if (showBar) {
                NavigationBar(containerColor = MaterialTheme.colorScheme.surface) {
                    tabs.forEach { tab ->
                        val selected = currentRoute == tab.route
                        NavigationBarItem(
                            selected = selected,
                            onClick = {
                                if (!selected) {
                                    nav.navigate(tab.route) {
                                        popUpTo("home") { saveState = true }
                                        launchSingleTop = true
                                        restoreState = true
                                    }
                                }
                            },
                            icon = tab.icon,
                            label = { Text(stringResource(tab.labelRes)) },
                            colors = NavigationBarItemDefaults.colors(
                                selectedIconColor = MaterialTheme.colorScheme.primary,
                                selectedTextColor = MaterialTheme.colorScheme.primary,
                                indicatorColor = MaterialTheme.colorScheme.primaryContainer,
                            ),
                        )
                    }
                }
            }
        },
    ) { padding ->
        NavHost(
            navController = nav,
            startDestination = "home",
            modifier = Modifier.padding(padding),
        ) {
            composable("home") { HomeScreen(nav) }
            composable("search") { SearchScreen(nav) }
            composable(
                route = "browse?type={type}&genre={genre}",
                arguments = listOf(
                    navArgument("type") { type = NavType.StringType; nullable = true; defaultValue = null },
                    navArgument("genre") { type = NavType.StringType; nullable = true; defaultValue = null },
                ),
            ) { entry ->
                BrowseScreen(
                    nav,
                    entry.arguments?.getString("type"),
                    entry.arguments?.getString("genre"),
                )
            }
            composable("vip") { VipScreen(nav) }
            composable("profile") { ProfileScreen(nav) }
            composable("list") { WatchlistScreen(nav) }
            composable(
                route = "auth?mode={mode}",
                arguments = listOf(
                    navArgument("mode") { type = NavType.StringType; defaultValue = "login" },
                ),
            ) { entry ->
                AuthScreen(nav, entry.arguments?.getString("mode") ?: "login")
            }
            composable("details/{slug}") { entry ->
                DetailsScreen(nav, entry.arguments?.getString("slug") ?: "")
            }
            composable(
                route = "watch/{slug}?e={e}",
                arguments = listOf(
                    navArgument("slug") { type = NavType.StringType },
                    navArgument("e") { type = NavType.StringType; nullable = true; defaultValue = "" },
                ),
            ) { entry ->
                PlayerScreen(
                    nav,
                    entry.arguments?.getString("slug") ?: "",
                    entry.arguments?.getString("e") ?: "",
                )
            }
        }
    }
}

// ===== مساعدات تنقل =====
fun NavHostController.goDetails(slug: String) = navigate("details/$slug")
fun NavHostController.goWatch(slug: String, episodeId: String?) =
    navigate(if (episodeId.isNullOrBlank()) "watch/$slug" else "watch/$slug?e=$episodeId")
