package com.forsetijudge.core.port.input.usecase.contest

import com.forsetijudge.core.port.dto.response.contest.ContestWithMembersAndProblemsResponseBodyDTO
import java.util.UUID

interface ForceStartContestUseCase {
    /**
     * Forces the start of a contest.
     *
     * @param command The command containing the contest ID to force start.
     * @return The updated Contest object after being forced to start.
     */
    fun execute(command: Command): ContestWithMembersAndProblemsResponseBodyDTO

    /**
     * Command for forcing the start of a contest.
     *
     * @param contestId The ID of the contest to force start.
     */
    data class Command(
        val contestId: UUID,
    )
}
