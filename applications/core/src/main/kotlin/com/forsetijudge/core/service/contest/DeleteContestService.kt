package com.forsetijudge.core.service.contest

import com.forsetijudge.core.port.input.usecase.contest.DeleteContestUseCase

class DeleteContestService : DeleteContestUseCase {
    /**
     * Deletes a contest with the provided command.
     *
     * @param command The command containing the contest ID to be deleted.
     */
    override fun execute(command: DeleteContestUseCase.Command) {
        TODO("Not yet implemented")
    }
}
