package com.forsetijudge.core.port.driving.usecase.session

import com.forsetijudge.core.domain.entity.Session
import java.util.UUID

interface RefreshSessionUseCase {
    /**
     * Creates a new session for the member with the given ID.
     * Keep the current session if it is still valid.
     *
     * @param memberId The ID of the member
     * @return The new or existing session
     */
    fun refresh(memberId: UUID): Session
}
