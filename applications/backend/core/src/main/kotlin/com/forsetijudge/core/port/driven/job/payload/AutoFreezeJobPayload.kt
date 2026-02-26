package com.forsetijudge.core.port.driven.job.payload

import java.io.Serializable
import java.util.UUID

data class AutoFreezeJobPayload(
    val contestId: UUID,
) : Serializable
