package com.forsetijudge.core.port.driving.usecase.external.authentication

import com.forsetijudge.core.application.util.ContestAuthorizer

interface ContestAuthorizerUseCase {
    /**
     * Executes the given command to perform contest authorization checks.
     *
     * @param command The command containing the contest ID, optional member ID, and a lambda function that takes a ContestAuthorizer to perform authorization checks.
     */
    fun execute(command: Command)

    /**
     * Data class representing the command for contest authorization.
     *
     * @param chain A lambda function that takes a ContestAuthorizer as an argument and performs the necessary authorization checks. The ContestAuthorizer provides methods to check various authorization conditions related to the contest and member.
     */
    data class Command(
        val chain: (contestAuthorizer: ContestAuthorizer) -> Unit,
    )
}
