package com.forsetijudge.core.service.contest

import com.forsetijudge.core.port.dto.response.contest.ContestWithMembersAndProblemsResponseBodyDTO
import com.forsetijudge.core.port.input.usecase.contest.ForceStartContestUseCase

class ForceStartContestService : ForceStartContestUseCase {
    /**
     * Forces the start of a contest.
     *
     * @param command The command containing the contest ID to force start.
     * @return The updated Contest object after being forced to start.
     */
    override fun execute(command: ForceStartContestUseCase.Command): ContestWithMembersAndProblemsResponseBodyDTO {
        TODO("Not yet implemented")
    }
}
