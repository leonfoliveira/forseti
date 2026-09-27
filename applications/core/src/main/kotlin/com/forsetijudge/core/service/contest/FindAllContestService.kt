package com.forsetijudge.core.service.contest

import com.forsetijudge.core.port.dto.response.contest.ContestResponseBodyDTO
import com.forsetijudge.core.port.input.usecase.contest.FindAllContestUseCase

class FindAllContestService : FindAllContestUseCase {
    /**
     * Finds all contests available in the system.
     *
     * @return A list of contests available in the system.
     */
    override fun execute(): List<ContestResponseBodyDTO> {
        TODO("Not yet implemented")
    }
}
