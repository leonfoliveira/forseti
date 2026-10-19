package com.forsetijudge.core.port.input.usecase.contest

import com.forsetijudge.core.port.dto.response.contest.ContestWithMembersAndProblemsResponseDTO
import java.util.UUID

interface UnfreezeContestUseCase {
    /**
     * Unfreezes the contest with the given ID, allowing modifications and submissions to resume.
     *
     * @param command The command containing the contest ID to be unfrozen.
     * @return A ContestWithMembersAndProblemsResponseDTO containing the updated contest information.
     */
    fun execute(command: Command): ContestWithMembersAndProblemsResponseDTO

    /**
     * Command class representing the input parameters for unfreezing a contest.
     *
     * @property contestId The unique identifier of the contest to be unfrozen.
     */
    data class Command(
        val contestId: UUID,
    )
}
