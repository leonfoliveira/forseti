package com.forsetijudge.core.port.driven.scheduler.payload

import java.io.Serializable
import java.util.UUID

data class AutoFreezeJobPayload(
    val contestId: UUID,
) : Serializable
