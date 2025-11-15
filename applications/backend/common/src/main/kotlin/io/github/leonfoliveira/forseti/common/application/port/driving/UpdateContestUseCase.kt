package io.github.leonfoliveira.forseti.common.application.port.driving

import io.github.leonfoliveira.forseti.common.application.domain.entity.Contest
import io.github.leonfoliveira.forseti.common.application.dto.input.contest.UpdateContestInputDTO
import java.util.UUID

interface UpdateContestUseCase {
    fun update(inputDTO: UpdateContestInputDTO): Contest

    fun forceStart(contestId: UUID): Contest

    fun forceEnd(contestId: UUID): Contest
}
