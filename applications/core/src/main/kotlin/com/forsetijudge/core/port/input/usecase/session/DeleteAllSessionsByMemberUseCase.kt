package com.forsetijudge.core.port.input.usecase.session

interface DeleteAllSessionsByMemberUseCase {
    /**
     * Deletes all sessions associated with a specific member.
     */
    fun execute(command: Command)

    data class Command(
        val memberId: String,
    )
}
