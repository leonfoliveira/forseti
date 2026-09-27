package com.forsetijudge.core.port.input.usecase.contest

import com.forsetijudge.core.port.dto.response.contest.ContestWithMembersAndProblemsResponseBodyDTO
import java.util.UUID

interface ForceEndContestUseCase {
    /**
     * Forces the end of a contest.
     *
     * @param command The command containing the contest ID to force end.
     * @return The updated Contest object after being forced to end.
     */
    fun execute(command: Command): ContestWithMembersAndProblemsResponseBodyDTO

    /**
     * Command for forcing the end of a contest.
     *
     * @param contestId The ID of the contest to force end.
     */
    data class Command(
        val contestId: UUID,
    )
}
