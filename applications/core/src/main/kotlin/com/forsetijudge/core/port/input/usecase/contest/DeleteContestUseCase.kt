package com.forsetijudge.core.port.input.usecase.contest

import java.util.UUID

interface DeleteContestUseCase {
    /**
     * Deletes a contest with the provided command.
     *
     * @param command The command containing the contest ID to be deleted.
     */
    fun execute(command: Command)

    /**
     * Command for deleting a contest.
     *
     * @param contestId The ID of the contest to be deleted.
     */
    data class Command(
        val contestId: UUID,
    )
}
