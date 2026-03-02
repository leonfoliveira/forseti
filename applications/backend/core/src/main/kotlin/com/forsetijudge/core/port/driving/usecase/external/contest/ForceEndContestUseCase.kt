package com.forsetijudge.core.port.driving.usecase.external.contest

import com.forsetijudge.core.domain.entity.Contest
import com.forsetijudge.core.port.dto.response.contest.ContestResponseBodyDTO
import com.forsetijudge.core.port.dto.response.contest.ContestWithMembersAndProblemsResponseBodyDTO

interface ForceEndContestUseCase {
    /**
     * Forces the end of a contest.
     *
     * @return The updated Contest object after being forced to end.
     */
    fun execute(): ContestWithMembersAndProblemsResponseBodyDTO
}
