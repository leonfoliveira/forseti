package com.forsetijudge.core.service.contest

import com.forsetijudge.core.port.dto.response.contest.ContestResponseBodyDTO
import com.forsetijudge.core.port.input.usecase.contest.FindContestBySlugUseCase

class FindContestBySlugService : FindContestBySlugUseCase {
    /**
     * Find a contest by its slug.
     *
     * @param command The command containing the slug of the contest to find.
     * @return The contest with the specified slug.
     */
    override fun execute(command: FindContestBySlugUseCase.Command): ContestResponseBodyDTO {
        TODO("Not yet implemented")
    }
}
