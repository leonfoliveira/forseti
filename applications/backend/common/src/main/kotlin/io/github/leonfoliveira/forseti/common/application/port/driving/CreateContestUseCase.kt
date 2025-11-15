package io.github.leonfoliveira.forseti.common.application.port.driving

import io.github.leonfoliveira.forseti.common.application.domain.entity.Contest
import io.github.leonfoliveira.forseti.common.application.dto.input.contest.CreateContestInputDTO

interface CreateContestUseCase {
    /**
     * Creates a new contest based on the provided input data.
     *
     * @param inputDTO The data required to create the contest.
     * @return The created contest entity.
     */
    fun create(inputDTO: CreateContestInputDTO): Contest
}
