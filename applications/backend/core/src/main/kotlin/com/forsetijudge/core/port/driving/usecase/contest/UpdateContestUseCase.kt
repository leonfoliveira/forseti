package com.forsetijudge.core.port.driving.usecase.contest

import com.forsetijudge.core.domain.entity.Contest
import com.forsetijudge.core.port.dto.input.contest.UpdateContestInputDTO
import jakarta.validation.Valid
import java.util.UUID

interface UpdateContestUseCase {
    /**
     * Updates a contest with the provided input data.
     *
     * @param inputDTO The input data containing the contest updates.
     * @return The updated contest entity.
     */
    fun update(
        contestId: UUID,
        @Valid inputDTO: UpdateContestInputDTO,
    ): Contest

    /**
     * Forces a contest to start immediately, regardless of its scheduled start time.
     *
     * @param contestId The ID of the contest to force start.
     * @return The updated contest entity.
     */
    fun forceStart(contestId: UUID): Contest

    /**
     * Forces a contest to end immediately, regardless of its scheduled end time.
     *
     * @param contestId The ID of the contest to force end.
     * @return The updated contest entity.
     */
    fun forceEnd(contestId: UUID): Contest
}
