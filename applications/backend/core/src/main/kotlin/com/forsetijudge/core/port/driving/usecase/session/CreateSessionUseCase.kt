package com.forsetijudge.core.port.driving.usecase.session

import com.forsetijudge.core.domain.entity.Contest
import com.forsetijudge.core.domain.entity.Member
import com.forsetijudge.core.domain.entity.Session

interface CreateSessionUseCase {
    /**
     * Creates a new session for a given member.
     *
     * @param contest The contest associated with the session, if any.
     * @param member The member for whom to create the session.
     * @return The created session.
     */
    fun create(
        contest: Contest?,
        member: Member,
    ): Session
}
