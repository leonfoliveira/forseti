package com.forsetijudge.core.port.input.usecase.contest

import java.util.UUID

interface AutoFreezeContestUseCase {
    /**
     * Automatically Freezes the contest with the given ID, preventing further modifications or submissions.
     *
     * @param command The command containing the contest ID to be frozen.
     */
    fun execute(command: Command)

    /**
     * Command class representing the input parameters for freezing a contest.
     *
     * @property contestId The unique identifier of the contest to be frozen.
     */
    data class Command(
        val contestId: UUID,
        val bypassMemberAuthorization: Boolean = false,
    )
}
