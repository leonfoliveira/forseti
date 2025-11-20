package live.forseti.core.port.driving.usecase

import jakarta.validation.Valid
import live.forseti.core.domain.entity.Contest
import live.forseti.core.port.dto.input.contest.UpdateContestInputDTO
import java.util.UUID

interface UpdateContestUseCase {
    /**
     * Updates a contest with the provided input data.
     *
     * @param inputDTO The input data containing the contest updates.
     * @return The updated contest entity.
     */
    fun update(
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
