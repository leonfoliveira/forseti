package com.forsetijudge.core.service.contest

import com.forsetijudge.core.port.dto.response.contest.ContestResponseBodyDTO
import com.forsetijudge.core.port.input.usecase.contest.CreateContestUseCase

class CreateContestService : CreateContestUseCase {
    /**
     * Creates a new contest with the provided command data.
     *
     * @param command The command containing the data for creating the contest.
     * @return The created contest entity.
     */
    override fun execute(command: CreateContestUseCase.Command): ContestResponseBodyDTO {
        TODO("Not yet implemented")
    }
}
