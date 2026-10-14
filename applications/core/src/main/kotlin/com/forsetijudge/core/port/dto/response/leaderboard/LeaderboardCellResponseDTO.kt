package com.forsetijudge.core.port.dto.response.leaderboard

import com.forsetijudge.core.domain.model.Leaderboard
import java.io.Serializable
import java.time.OffsetDateTime
import java.util.UUID

data class LeaderboardCellResponseDTO(
    val memberId: UUID,
    val problemId: UUID,
    val isAccepted: Boolean,
    val acceptedAt: OffsetDateTime?,
    val wrongSubmissions: Int,
    val penalty: Int,
) : Serializable

fun Leaderboard.Cell.toResponseDTO(): LeaderboardCellResponseDTO =
    LeaderboardCellResponseDTO(
        memberId = memberId,
        problemId = problemId,
        isAccepted = isAccepted,
        acceptedAt = acceptedAt,
        wrongSubmissions = wrongSubmissions,
        penalty = penalty,
    )
