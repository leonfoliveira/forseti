package io.github.leonfoliveira.forseti.common.application.port.driving

import io.github.leonfoliveira.forseti.common.application.domain.entity.Contest
import io.github.leonfoliveira.forseti.common.application.dto.input.contest.CreateContestInputDTO

interface CreateContestUseCase {
    fun create(inputDTO: CreateContestInputDTO): Contest
}
