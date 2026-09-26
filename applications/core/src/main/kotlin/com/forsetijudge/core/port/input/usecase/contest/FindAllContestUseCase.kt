package com.forsetijudge.core.port.input.usecase.contest

import com.forsetijudge.core.port.dto.response.contest.ContestResponseBodyDTO

interface FindAllContestUseCase {
    /**
     * Finds all contests available in the system.
     *
     * @return A list of contests available in the system.
     */
    fun execute(): List<ContestResponseBodyDTO>
}
