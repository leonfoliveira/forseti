package com.forsetijudge.core.api.http.sse.fanout

data class SSEFanoutMessage(
    val room: String,
    val eventName: String,
    val data: Any,
)
