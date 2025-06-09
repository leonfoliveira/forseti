package io.leonfoliveira.judge.core.service.dto.output

import java.time.OffsetDateTime
import java.util.UUID

object ContestLeaderboardOutputDTOMockFactory {
    fun build(
        contestId: UUID = UUID.randomUUID(),
        slug: String = "mock-contest-slug",
        startAt: OffsetDateTime = OffsetDateTime.now(),
        classification: List<ContestLeaderboardOutputDTO.MemberDTO> = emptyList(),
        issuedAt: OffsetDateTime = OffsetDateTime.now(),
    ) = ContestLeaderboardOutputDTO(
        contestId = contestId,
        slug = slug,
        startAt = startAt,
        classification = classification,
        issuedAt = issuedAt,
    )
}
