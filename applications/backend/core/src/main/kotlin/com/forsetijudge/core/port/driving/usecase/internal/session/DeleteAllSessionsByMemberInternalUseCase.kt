package com.forsetijudge.core.port.driving.usecase.internal.session

import com.forsetijudge.core.domain.entity.Member

interface DeleteAllSessionsByMemberInternalUseCase {
    /**
     * Deletes all sessions associated with a specific member.
     *
     * @param command The command containing the member for whom the sessions should be deleted.
     */
    fun execute(command: Command)

    /**
     * Command for deleting all sessions by member.
     *
     * @param member The member whose sessions are to be deleted.
     */
    data class Command(
        val member: Member,
    )
}
