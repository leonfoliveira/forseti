package com.forsetijudge.core.port.driving.usecase.external.contest

import com.forsetijudge.core.domain.entity.Contest

interface FindAllContestUseCase {
    /**
     * Finds all contests available in the system.
     *
     * @return A list of contests available in the system.
     */
    fun execute(): List<Contest>
}
