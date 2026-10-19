package com.forsetijudge.core.port.input.usecase.contest

import com.forsetijudge.core.port.dto.response.contest.ContestWithMembersAndProblemsResponseDTO
import java.util.UUID

interface FreezeContestUseCase {
    /**
     * Freezes the contest with the given ID, preventing further modifications or submissions.
     *
     * @param command The command containing the contest ID to be frozen.
     * @return A ContestWithMembersAndProblemsResponseDTO containing the updated contest information.
     */
    fun execute(command: Command): ContestWithMembersAndProblemsResponseDTO

    /**
     * Command class representing the input parameters for freezing a contest.
     *
     * @property contestId The unique identifier of the contest to be frozen.
     * @property bypassMemberAuthorization A flag indicating whether to bypass member authorization checks (default is false).
     */
    data class Command(
        val contestId: UUID,
        val bypassMemberAuthorization: Boolean = false,
    )
}
