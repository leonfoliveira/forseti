package com.forsetijudge.core.port.input.usecase.contest

import com.forsetijudge.core.port.dto.response.contest.ContestResponseDTO
import java.util.UUID

interface FindContestByIdUseCase {
    /**
     * Find a contest by its id.
     *
     * @param command The command containing the id of the contest to find.
     * @return The contest with the specified id.
     */
    fun execute(command: Command): ContestResponseDTO

    /**
     * Command for finding a contest by its id.
     *
     * @param id The id of the contest to find.
     */
    data class Command(
        val id: UUID,
    )
}
