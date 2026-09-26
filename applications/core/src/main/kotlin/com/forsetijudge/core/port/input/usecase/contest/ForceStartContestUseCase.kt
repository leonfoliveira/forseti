package com.forsetijudge.core.port.input.usecase.contest

import com.forsetijudge.core.port.dto.response.contest.ContestWithMembersAndProblemsResponseBodyDTO

interface ForceStartContestUseCase {
    /**
     * Forces the start of a contest.
     *
     * @return The updated Contest object after being forced to start.
     */
    fun execute(): ContestWithMembersAndProblemsResponseBodyDTO
}
