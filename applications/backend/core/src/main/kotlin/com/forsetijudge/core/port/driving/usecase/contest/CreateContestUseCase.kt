package com.forsetijudge.core.port.driving.usecase.contest

import com.forsetijudge.core.domain.entity.Contest
import com.forsetijudge.core.port.dto.input.contest.CreateContestInputDTO
import jakarta.validation.Valid

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
