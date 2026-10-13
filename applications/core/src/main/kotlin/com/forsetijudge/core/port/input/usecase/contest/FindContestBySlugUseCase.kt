package com.forsetijudge.core.port.input.usecase.contest

import com.forsetijudge.core.port.dto.response.contest.ContestResponseDTO

interface FindContestBySlugUseCase {
    /**
     * Find a contest by its slug.
     *
     * @param command The command containing the slug of the contest to find.
     * @return The contest with the specified slug.
     */
    fun execute(command: Command): ContestResponseDTO

    /**
     * Command for finding a contest by its slug.
     *
     * @param slug The slug of the contest to find.
     */
    data class Command(
        val slug: String,
    )
}
