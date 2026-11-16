package com.forsetijudge.core.domain.model

import com.forsetijudge.core.domain.entity.Member
import com.forsetijudge.core.util.IdGenerator
import java.time.OffsetDateTime
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Test

class LeaderboardTest {
    @Test
    fun `test Leaderboard creation`() {
        val leaderboard =
            Leaderboard(
                contestId = IdGenerator.getUUID(),
                contestStartAt = OffsetDateTime.now(),
                rows =
                    listOf(
                        Leaderboard.Row(
                            memberId = IdGenerator.getUUID(),
                            memberName = "Contestant 1",
                            memberType = Member.Type.CONTESTANT,
                            score = 5,
                            penalty = 10,
                            cells =
                                listOf(
                                    Leaderboard.Cell(
                                        memberId = IdGenerator.getUUID(),
                                        problemId = IdGenerator.getUUID(),
                                        problemLetter = 'A',
                                        problemColor = "#00FF00",
                                        isAccepted = true,
                                        acceptedAt = OffsetDateTime.now(),
                                        wrongSubmissions = 1,
                                        penalty = 5,
                                    ),
                                ),
                        ),
                    ),
            )

        assertEquals(1, leaderboard.rows.size)
        assertEquals(1, leaderboard.rows[0].cells.size)
    }
}
