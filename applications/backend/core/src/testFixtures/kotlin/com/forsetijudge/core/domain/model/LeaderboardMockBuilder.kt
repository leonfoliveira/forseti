package com.forsetijudge.core.domain.model

import com.forsetijudge.core.application.util.IdGenerator
import java.time.OffsetDateTime
import java.util.UUID

object LeaderboardMockBuilder {
    fun build(
        contestId: UUID = IdGenerator.getUUID(),
        isFrozen: Boolean = false,
        rows: List<Leaderboard.Row> = listOf(buildRow(), buildRow()),
        issuedAt: OffsetDateTime = OffsetDateTime.now(),
    ): Leaderboard =
        Leaderboard(
            contestId = contestId,
            isFrozen = isFrozen,
            rows = rows,
            issuedAt = issuedAt,
        )

    fun buildRow(
        memberId: UUID = IdGenerator.getUUID(),
        memberName: String = "Member ${memberId.toString().take(8)}",
        score: Int = 0,
        penalty: Int = 0,
        cells: List<Leaderboard.Cell> = listOf(buildCell(), buildCell()),
    ): Leaderboard.Row =
        Leaderboard.Row(
            memberId = memberId,
            memberName = memberName,
            score = score,
            penalty = penalty,
            cells = cells,
        )

    fun buildCell(
        problemId: UUID = IdGenerator.getUUID(),
        isAccepted: Boolean = false,
        acceptedAt: OffsetDateTime? = null,
        wrongSubmissions: Int = 0,
        penalty: Int = 0,
    ): Leaderboard.Cell =
        Leaderboard.Cell(
            problemId = problemId,
            isAccepted = isAccepted,
            acceptedAt = acceptedAt,
            wrongSubmissions = wrongSubmissions,
            penalty = penalty,
        )
}
