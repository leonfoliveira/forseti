package com.forsetijudge.core.domain.event

import java.util.UUID

interface ClarificationEvent : BusinessEvent {
    /**
     * Event published when a clarification is created
     *
     * @param clarificationId the created clarification
     */
    data class Created(
        val clarificationId: UUID,
    ) : ClarificationEvent

    /**
     * Event published when a clarification is deleted
     *
     * @param clarificationId the deleted clarification
     */
    data class Deleted(
        val contestId: UUID,
        val clarificationId: UUID,
    ) : ClarificationEvent
}
