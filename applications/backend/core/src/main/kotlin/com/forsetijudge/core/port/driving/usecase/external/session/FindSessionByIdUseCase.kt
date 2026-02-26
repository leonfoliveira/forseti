package com.forsetijudge.core.port.driving.usecase.external.session

import com.forsetijudge.core.domain.entity.Session
import java.util.UUID

interface FindSessionByIdUseCase {
    /**
     * @return the session found by the given id
     */
    fun execute(command: Command): Session

    /**
     * @param sessionId the id of the session to find
     */
    data class Command(
        val sessionId: UUID,
    )
}
