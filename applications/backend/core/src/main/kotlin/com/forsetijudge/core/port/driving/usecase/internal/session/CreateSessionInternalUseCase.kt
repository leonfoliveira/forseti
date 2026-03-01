package com.forsetijudge.core.port.driving.usecase.internal.session

import com.forsetijudge.core.domain.entity.Member
import com.forsetijudge.core.domain.entity.Session

interface CreateSessionInternalUseCase {
    /**
     * Creates a new session for the specified contest and member.
     *
     * @param command The command containing the contest and member for which to create a session.
     * @return The result of creating a new session, including the created session.
     */
    fun execute(command: Command): Session

    /**
     * Command for creating a new session.
     *
     * @param member The member for whom to create the session.
     */
    data class Command(
        val member: Member,
    )
}
