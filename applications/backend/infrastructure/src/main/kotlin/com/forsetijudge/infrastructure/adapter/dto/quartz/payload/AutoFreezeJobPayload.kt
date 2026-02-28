package com.forsetijudge.infrastructure.adapter.dto.quartz.payload

import java.io.Serializable
import java.util.UUID

data class AutoFreezeJobPayload(
    val contestId: UUID,
) : Serializable
