package live.forseti.core.port.driving.usecase.contest

import jakarta.validation.Valid
import live.forseti.core.domain.entity.Contest
import live.forseti.core.port.dto.input.contest.CreateContestInputDTO

interface CreateContestUseCase {
    /**
     * Creates a new contest based on the provided input data.
     *
     * @param inputDTO The data required to create the contest.
     * @return The created contest entity.
     */
    fun create(
        @Valid inputDTO: CreateContestInputDTO,
    ): Contest
}
