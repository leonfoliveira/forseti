package com.forsetijudge.core.port.driven.broadcast

import com.forsetijudge.core.application.util.IdGenerator
import java.io.Serializable
import java.util.UUID

data class BroadcastEvent(
    val id: UUID = IdGenerator.getUUID(),
    val room: String,
    val name: String,
    val data: Serializable? = null,
) : Serializable
