package com.forsetijudge.core.port.driving.usecase.external.contest

import com.forsetijudge.core.domain.entity.Contest
import com.forsetijudge.core.port.dto.response.contest.ContestResponseBodyDTO

interface FindContestBySlugUseCase {
    /**
     * Find a contest by its slug.
     *
     * @param command The command containing the slug of the contest to find.
     * @return The contest with the specified slug.
     */
    fun execute(command: Command): ContestResponseBodyDTO

    /**
     * Command for finding a contest by its slug.
     *
     * @param slug The slug of the contest to find.
     */
    data class Command(
        val slug: String,
    )
}
