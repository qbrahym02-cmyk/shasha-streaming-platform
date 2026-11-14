package com.shasha.app

import android.app.Application
import com.shasha.app.data.Api
import com.shasha.app.data.Session
import com.shasha.app.util.Lang

class ShashaApp : Application() {
    override fun onCreate() {
        super.onCreate()
        Api.init(this)
        Session.init(this)
        Lang.init(this)
    }
}
