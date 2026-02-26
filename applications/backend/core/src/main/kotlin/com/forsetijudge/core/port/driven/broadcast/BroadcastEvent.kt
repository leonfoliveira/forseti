package com.forsetijudge.core.port.driven.broadcast

import com.forsetijudge.core.application.util.IdGenerator
import java.io.Serializable
import java.time.OffsetDateTime
import java.util.UUID

data class BroadcastEvent(
    val id: UUID = IdGenerator.getUUID(),
    val room: String,
    val name: String,
    val data: Serializable? = null,
    val timestamp: OffsetDateTime = OffsetDateTime.now(),
) : Serializable
