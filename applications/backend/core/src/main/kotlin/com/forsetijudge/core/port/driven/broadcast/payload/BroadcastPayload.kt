package com.forsetijudge.core.port.driven.broadcast.payload

import com.forsetijudge.core.port.driven.broadcast.BroadcastEvent
import com.forsetijudge.core.port.driven.broadcast.BroadcastTopic
import java.io.Serializable

data class BroadcastPayload(
    val topic: BroadcastTopic,
    val event: BroadcastEvent,
    val body: Serializable? = null,
) : Serializable
