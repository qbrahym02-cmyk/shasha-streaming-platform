package com.shasha.app.ui.icons

import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.SolidColor
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.graphics.vector.path
import androidx.compose.ui.unit.dp

// أيقونات مخصصة غير موجودة في مجموعة material-icons-core

val IconPause: ImageVector by lazy {
    ImageVector.Builder(
        name = "ShashaPause",
        defaultWidth = 24.dp,
        defaultHeight = 24.dp,
        viewportWidth = 24f,
        viewportHeight = 24f,
    ).apply {
        path(fill = SolidColor(Color.White)) {
            moveTo(6f, 5f); lineTo(10f, 5f); lineTo(10f, 19f); lineTo(6f, 19f); close()
            moveTo(14f, 5f); lineTo(18f, 5f); lineTo(18f, 19f); lineTo(14f, 19f); close()
        }
    }.build()
}

val IconSkipNext: ImageVector by lazy {
    ImageVector.Builder(
        name = "ShashaSkipNext",
        defaultWidth = 24.dp,
        defaultHeight = 24.dp,
        viewportWidth = 24f,
        viewportHeight = 24f,
    ).apply {
        path(fill = SolidColor(Color.White)) {
            moveTo(6f, 18f); lineTo(14.5f, 12f); lineTo(6f, 6f); close()
            moveTo(16f, 6f); lineTo(19f, 6f); lineTo(19f, 18f); lineTo(16f, 18f); close()
        }
    }.build()
}

val IconSkipPrev: ImageVector by lazy {
    ImageVector.Builder(
        name = "ShashaSkipPrev",
        defaultWidth = 24.dp,
        defaultHeight = 24.dp,
        viewportWidth = 24f,
        viewportHeight = 24f,
    ).apply {
        path(fill = SolidColor(Color.White)) {
            moveTo(18f, 6f); lineTo(9.5f, 12f); lineTo(18f, 18f); close()
            moveTo(8f, 6f); lineTo(5f, 6f); lineTo(5f, 18f); lineTo(8f, 18f); close()
        }
    }.build()
}

val IconFullscreen: ImageVector by lazy {
    ImageVector.Builder(
        name = "ShashaFullscreen",
        defaultWidth = 24.dp,
        defaultHeight = 24.dp,
        viewportWidth = 24f,
        viewportHeight = 24f,
    ).apply {
        path(fill = SolidColor(Color.White)) {
            moveTo(7f, 14f); lineTo(5f, 14f); lineTo(5f, 19f); lineTo(10f, 19f); lineTo(10f, 17f); lineTo(7f, 17f); close()
            moveTo(5f, 10f); lineTo(7f, 10f); lineTo(7f, 7f); lineTo(10f, 7f); lineTo(10f, 5f); lineTo(5f, 5f); close()
            moveTo(17f, 17f); lineTo(14f, 17f); lineTo(14f, 19f); lineTo(19f, 19f); lineTo(19f, 14f); lineTo(17f, 14f); close()
            moveTo(14f, 5f); lineTo(14f, 7f); lineTo(17f, 7f); lineTo(17f, 10f); lineTo(19f, 10f); lineTo(19f, 5f); close()
        }
    }.build()
}

val IconEye: ImageVector by lazy {
    ImageVector.Builder(
        name = "ShashaEye",
        defaultWidth = 24.dp,
        defaultHeight = 24.dp,
        viewportWidth = 24f,
        viewportHeight = 24f,
    ).apply {
        path(fill = SolidColor(Color.White)) {
            moveTo(12f, 4.5f)
            curveTo(7f, 4.5f, 2.73f, 7.61f, 1f, 12f)
            curveTo(2.73f, 16.39f, 7f, 19.5f, 12f, 19.5f)
            curveTo(17f, 19.5f, 21.27f, 16.39f, 23f, 12f)
            curveTo(21.27f, 7.61f, 17f, 4.5f, 12f, 4.5f)
            close()
            moveTo(12f, 17f)
            curveTo(9.24f, 17f, 7f, 14.76f, 7f, 12f)
            curveTo(7f, 9.24f, 9.24f, 7f, 12f, 7f)
            curveTo(14.76f, 7f, 17f, 9.24f, 17f, 12f)
            curveTo(17f, 14.76f, 14.76f, 17f, 12f, 17f)
            close()
            moveTo(12f, 9f)
            curveTo(10.34f, 9f, 9f, 10.34f, 9f, 12f)
            curveTo(9f, 13.66f, 10.34f, 15f, 12f, 15f)
            curveTo(13.66f, 15f, 15f, 13.66f, 15f, 12f)
            curveTo(15f, 10.34f, 13.66f, 9f, 12f, 9f)
            close()
        }
    }.build()
}

val IconEyeOff: ImageVector by lazy {
    ImageVector.Builder(
        name = "ShashaEyeOff",
        defaultWidth = 24.dp,
        defaultHeight = 24.dp,
        viewportWidth = 24f,
        viewportHeight = 24f,
    ).apply {
        path(fill = SolidColor(Color.White)) {
            moveTo(12f, 6.5f)
            curveTo(15.79f, 6.5f, 19.14f, 8.64f, 20.82f, 12f)
            curveTo(20.1f, 13.51f, 19.02f, 14.79f, 17.7f, 15.75f)
            lineTo(19.1f, 17.15f)
            curveTo(20.88f, 15.86f, 22.27f, 14.08f, 23f, 12f)
            curveTo(21.27f, 7.61f, 17f, 4.5f, 12f, 4.5f)
            curveTo(10.6f, 4.5f, 9.26f, 4.76f, 8.03f, 5.24f)
            lineTo(9.53f, 6.74f)
            curveTo(10.33f, 6.59f, 11.15f, 6.5f, 12f, 6.5f)
            close()
            moveTo(11f, 8.22f)
            lineTo(13.5f, 10.72f)
            curveTo(13.58f, 10.49f, 13.63f, 10.25f, 13.63f, 10f)
            curveTo(13.63f, 8.62f, 12.51f, 7.5f, 11.13f, 7.5f)
            curveTo(11.08f, 7.5f, 11.04f, 7.51f, 11f, 7.51f)
            close()
            moveTo(2.71f, 3.16f)
            lineTo(1.29f, 4.58f)
            lineTo(4.07f, 7.36f)
            curveTo(2.83f, 8.66f, 1.86f, 10.24f, 1.29f, 12f)
            curveTo(3.02f, 16.39f, 7.29f, 19.5f, 12.29f, 19.5f)
            curveTo(13.9f, 19.5f, 15.43f, 19.15f, 16.81f, 18.5f)
            lineTo(19.71f, 21.4f)
            lineTo(21.13f, 19.98f)
            lineTo(2.71f, 3.16f)
            close()
            moveTo(7.53f, 10.82f)
            lineTo(9.09f, 12.38f)
            curveTo(9.05f, 12.58f, 9.02f, 12.79f, 9.02f, 13f)
            curveTo(9.02f, 14.93f, 10.59f, 16.5f, 12.52f, 16.5f)
            curveTo(12.73f, 16.5f, 12.94f, 16.47f, 13.14f, 16.43f)
            lineTo(14.7f, 17.99f)
            curveTo(13.97f, 18.32f, 13.17f, 18.5f, 12.33f, 18.5f)
            curveTo(8.54f, 18.5f, 5.19f, 16.36f, 3.51f, 13f)
            curveTo(4.21f, 11.54f, 5.27f, 10.29f, 6.57f, 9.36f)
            close()
        }
    }.build()
}

val IconCrown: ImageVector by lazy {
    ImageVector.Builder(
        name = "ShashaCrown",
        defaultWidth = 24.dp,
        defaultHeight = 24.dp,
        viewportWidth = 24f,
        viewportHeight = 24f,
    ).apply {
        path(fill = SolidColor(Color.White)) {
            moveTo(2.5f, 7f); lineTo(6.5f, 10.8f); lineTo(12f, 3.8f); lineTo(17.5f, 10.8f); lineTo(21.5f, 7f)
            lineTo(19.7f, 17f); lineTo(4.3f, 17f); close()
            moveTo(4.6f, 18.4f); lineTo(19.4f, 18.4f); curveTo(19.95f, 18.4f, 20.4f, 18.85f, 20.4f, 19.4f)
            curveTo(20.4f, 19.95f, 19.95f, 20.4f, 19.4f, 20.4f); lineTo(4.6f, 20.4f)
            curveTo(4.05f, 20.4f, 3.6f, 19.95f, 3.6f, 19.4f); curveTo(3.6f, 18.85f, 4.05f, 18.4f, 4.6f, 18.4f); close()
        }
    }.build()
}
