package com.forsetijudge.core.service.contest

import com.forsetijudge.core.port.dto.response.contest.ContestWithMembersAndProblemsResponseBodyDTO
import com.forsetijudge.core.port.input.usecase.contest.UpdateContestUseCase

class UpdateContestService : UpdateContestUseCase {
    /**
     * Updates an existing contest with the provided command data.
     *
     * @param command The command containing the data for updating the contest.
     * @return The updated contest entity.
     */
    override fun execute(command: UpdateContestUseCase.Command): ContestWithMembersAndProblemsResponseBodyDTO {
        TODO("Not yet implemented")
    }
}
