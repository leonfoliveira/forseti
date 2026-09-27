package com.forsetijudge.core.service.contest

import com.forsetijudge.core.port.dto.response.contest.ContestWithMembersAndProblemsResponseBodyDTO
import com.forsetijudge.core.port.input.usecase.contest.ForceEndContestUseCase

class ForceEndContestService : ForceEndContestUseCase {
    /**
     * Forces the end of a contest.
     *
     * @param command The command containing the contest ID to force end.
     * @return The updated Contest object after being forced to end.
     */
    override fun execute(command: ForceEndContestUseCase.Command): ContestWithMembersAndProblemsResponseBodyDTO {
        TODO("Not yet implemented")
    }
}
