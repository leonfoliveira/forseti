package com.forsetijudge.core.port.dto.output

import java.io.Serializable
import java.time.OffsetDateTime
import java.util.UUID

data class LeaderboardPartialOutputDTO(
    val memberId: UUID,
    val problemId: UUID,
    val letter: Char,
    val isAccepted: Boolean,
    val acceptedAt: OffsetDateTime? = null,
    val wrongSubmissions: Int,
    val penalty: Int,
) : Serializable
