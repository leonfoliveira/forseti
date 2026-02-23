package com.forsetijudge.core.port.driving.usecase.external.session

import com.forsetijudge.core.domain.entity.Session
import java.util.UUID

interface CreateSessionUseCase {
    /**
     * Creates a session for a member and an optional contest.
     *
     * @param command The command containing the member ID for which to create the session.
     * @return The created session.
     */
    fun execute(command: Command): Session

    /**
     * Command for creating a session.
     *
     * @param memberId The ID of the member for whom the session is being created.
     */
    data class Command(
        val contestId: UUID? = null,
        val memberId: UUID,
    )
}
