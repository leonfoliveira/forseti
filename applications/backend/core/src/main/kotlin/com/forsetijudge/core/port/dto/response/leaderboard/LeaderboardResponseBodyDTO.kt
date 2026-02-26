package com.forsetijudge.core.port.dto.response.leaderboard

import com.forsetijudge.core.domain.model.Leaderboard
import java.io.Serializable
import java.time.OffsetDateTime
import java.util.UUID

data class LeaderboardResponseBodyDTO(
    val contestId: UUID,
    val isFrozen: Boolean,
    val rows: List<Row>,
    val issuedAt: OffsetDateTime,
) : Serializable {
    data class Row(
        val memberId: UUID,
        val memberName: String,
        val score: Int,
        val penalty: Int,
        val cells: List<Cell>,
    )

    data class Cell(
        val problemId: UUID,
        val isAccepted: Boolean,
        val acceptedAt: OffsetDateTime?,
        val wrongSubmissions: Int,
        val penalty: Int,
    )
}

fun Leaderboard.toResponseBodyDTO(): LeaderboardResponseBodyDTO =
    LeaderboardResponseBodyDTO(
        contestId = this.contestId,
        isFrozen = this.isFrozen,
        rows =
            this.rows.map { row ->
                LeaderboardResponseBodyDTO.Row(
                    memberId = row.memberId,
                    memberName = row.memberName,
                    score = row.score,
                    penalty = row.penalty,
                    cells =
                        row.cells.map { cell ->
                            LeaderboardResponseBodyDTO.Cell(
                                problemId = cell.problemId,
                                isAccepted = cell.isAccepted,
                                acceptedAt = cell.acceptedAt,
                                wrongSubmissions = cell.wrongSubmissions,
                                penalty = cell.penalty,
                            )
                        },
                )
            },
        issuedAt = this.issuedAt,
    )
