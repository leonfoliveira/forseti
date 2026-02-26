package com.forsetijudge.core.port.driving.usecase.external.contest

import com.forsetijudge.core.domain.entity.Contest

interface ForceStartContestUseCase {
    /**
     * Forces the start of a contest.
     *
     * @return The updated Contest object after being forced to start.
     */
    fun execute(): Contest
}
