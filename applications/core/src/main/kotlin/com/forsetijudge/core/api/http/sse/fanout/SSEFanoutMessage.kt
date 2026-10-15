package com.forsetijudge.core.api.http.sse.fanout

import java.time.OffsetDateTime

data class SSEFanoutMessage(
    val room: String,
    val eventName: String,
    val data: Any,
    val createdAt: OffsetDateTime = OffsetDateTime.now(),
)
