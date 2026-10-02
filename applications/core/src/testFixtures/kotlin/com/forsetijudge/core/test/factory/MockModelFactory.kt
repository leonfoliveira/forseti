package com.forsetijudge.core.test.factory

import com.forsetijudge.core.domain.entity.Member
import com.forsetijudge.core.domain.model.Leaderboard
import com.forsetijudge.core.domain.model.Session
import java.time.OffsetDateTime
import java.util.UUID

object MockModelFactory {
    fun sessionMember(
        id: UUID = UUID.randomUUID(),
        type: Member.Type = Member.Type.CONTESTANT,
        name: String = "Sample member",
    ) = Session.Member(id, type, name)

    fun session(
        id: UUID = UUID.randomUUID(),
        contestId: UUID? = UUID.randomUUID(),
        member: Session.Member = sessionMember(),
        csrfToken: UUID = UUID.randomUUID(),
        expiresAt: OffsetDateTime = OffsetDateTime.now().plusHours(1),
    ) = Session(id, contestId, member, csrfToken, expiresAt)

    fun leaderboardCell(
        memberId: UUID = UUID.randomUUID(),
        problemId: UUID = UUID.randomUUID(),
        problemLetter: Char = 'A',
        isAccepted: Boolean = false,
        acceptedAt: OffsetDateTime? = null,
        wrongSubmissions: Int = 0,
        penalty: Int = 0,
    ) = Leaderboard.Cell(
        memberId = memberId,
        problemId = problemId,
        problemLetter = problemLetter,
        problemColor = "#123456",
        isAccepted = isAccepted,
        acceptedAt = acceptedAt,
        wrongSubmissions = wrongSubmissions,
        penalty = penalty,
    )

    fun leaderboardRow(
        memberId: UUID = UUID.randomUUID(),
        memberName: String = "Sample member",
        score: Int = 0,
        penalty: Int = 0,
        cells: List<Leaderboard.Cell> = emptyList(),
    ) = Leaderboard.Row(
        memberId = memberId,
        memberName = memberName,
        memberType = Member.Type.CONTESTANT,
        score = score,
        penalty = penalty,
        cells = cells,
    )

    fun leaderboard(
        contestId: UUID = UUID.randomUUID(),
        contestStartAt: OffsetDateTime = OffsetDateTime.now().minusHours(1),
        rows: List<Leaderboard.Row> = emptyList(),
    ) = Leaderboard(contestId, contestStartAt, rows)
}
