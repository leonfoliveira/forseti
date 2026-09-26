package com.forsetijudge.core.port.input.usecase.contest

import com.forsetijudge.core.port.dto.response.contest.ContestWithMembersAndProblemsResponseBodyDTO

interface ForceEndContestUseCase {
    /**
     * Forces the end of a contest.
     *
     * @return The updated Contest object after being forced to end.
     */
    fun execute(): ContestWithMembersAndProblemsResponseBodyDTO
}
