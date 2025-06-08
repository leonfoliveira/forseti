package io.leonfoliveira.judge.core.service.dto.output

import java.time.LocalDateTime
import java.util.UUID

object ContestLeaderboardOutputDTOMockFactory {
    fun build(
        id: UUID = UUID.randomUUID(),
        slug: String = "mock-contest-slug",
        classification: List<ContestLeaderboardOutputDTO.MemberDTO> = emptyList(),
        issuedAt: LocalDateTime = LocalDateTime.now(),
    ) = ContestLeaderboardOutputDTO(
        id = id,
        slug = slug,
        classification = classification,
        issuedAt = issuedAt,
    )
}
