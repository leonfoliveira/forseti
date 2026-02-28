package com.forsetijudge.core.port.driven.broadcast

import java.io.Serializable

data class BroadcastEvent(
    val room: String,
    val name: String,
    val data: Serializable? = null,
)
