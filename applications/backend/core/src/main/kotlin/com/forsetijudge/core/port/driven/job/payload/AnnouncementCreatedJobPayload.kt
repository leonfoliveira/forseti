package com.forsetijudge.core.port.driven.job.payload

import java.io.Serializable
import java.util.UUID

data class AnnouncementCreatedJobPayload(
    val contestId: UUID,
) : Serializable
