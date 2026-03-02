package com.forsetijudge.core.port.dto.response.leaderboard

import com.forsetijudge.core.domain.model.Leaderboard
import java.io.Serializable
import java.time.OffsetDateTime
import java.util.UUID

data class LeaderboardCellResponseBodyDTO(
    val memberId: UUID,
    val problemId: UUID,
    val isAccepted: Boolean,
    val acceptedAt: OffsetDateTime?,
    val wrongSubmissions: Int,
    val penalty: Int,
) : Serializable

fun Leaderboard.Cell.toResponseBodyDTO(): LeaderboardCellResponseBodyDTO =
    LeaderboardCellResponseBodyDTO(
        memberId = memberId,
        problemId = problemId,
        isAccepted = isAccepted,
        acceptedAt = acceptedAt,
        wrongSubmissions = wrongSubmissions,
        penalty = penalty,
    )
