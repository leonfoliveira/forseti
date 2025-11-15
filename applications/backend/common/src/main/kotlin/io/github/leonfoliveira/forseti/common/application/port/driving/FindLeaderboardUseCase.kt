package io.github.leonfoliveira.forseti.common.application.port.driving

import io.github.leonfoliveira.forseti.common.application.dto.output.LeaderboardOutputDTO
import java.util.UUID

interface FindLeaderboardUseCase {
    fun findByContestId(contestId: UUID): LeaderboardOutputDTO
}
