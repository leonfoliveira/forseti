package com.forsetijudge.core.port.input.usecase.session

interface DeleteAllSessionsByContextMemberUseCase {
    /**
     * Deletes all sessions associated with the member in the current context.
     */
    fun execute()
}
